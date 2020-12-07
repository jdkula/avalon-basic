import { NextApiResponse } from 'next';
import nextConnect, { NextConnect } from 'next-connect';
import middleware, { AvalonRequest } from './db/middleware';

type ExtendedRequest<RequestBase, Params extends Record<string, string>> = RequestBase & {
    params: Params;
};

type ExtractMiddleware<RequestBase, Params extends Record<string, string>> = (
    req: ExtendedRequest<RequestBase, Params>,
    res: NextApiResponse,
    next: () => void,
) => void | Promise<void>;

function makeExtractMiddleware<
    Params extends Record<QueryKey, string>,
    QueryKey extends string = keyof Params & string
>(params: QueryKey[]): ExtractMiddleware<AvalonRequest, Params> {
    return (req, res, next) => {
        req.params = {} as Params;
        for (const param of params) {
            // Params[QueryKey] should extend string if T extends Record<QueryKey, string>
            const extracted = req.query[param] as Params[QueryKey];
            if (typeof extracted !== 'string') {
                return res.status(400).end(`Expected param ${param} was not present`);
            }
            req.params[param] = extracted;
        }
        next();
    };
}

export default function apiRoute<
    Params extends Record<QueryKey, string>,
    QueryKey extends string = keyof Params & string
>(params?: QueryKey[]): NextConnect<ExtendedRequest<AvalonRequest, Params>, NextApiResponse> {
    if (params?.length > 0) {
        return nextConnect().use(middleware).use(makeExtractMiddleware(params));
    }
    return nextConnect().use(middleware);
}
