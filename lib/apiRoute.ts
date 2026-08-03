import { NextApiResponse } from 'next';
import {createRouter, expressWrapper} from 'next-connect';
import middleware, { AvalonRequest } from './db/middleware';
import { NodeRouter } from 'next-connect/dist/types/node';

type ExtendedRequest<RequestBase, Params extends Record<string, string>> = RequestBase & {
    params: Params;
};

type ExtractMiddleware<RequestBase, Params extends Record<string, string>> = (
    req: ExtendedRequest<RequestBase, Params>,
    res: NextApiResponse,
    next: () => void,
) => void | Promise<void>;

export default function apiRoute<
    Params extends Record<QueryKey, string>,
    QueryKey extends string = keyof Params & string
>(params?: QueryKey[]): NodeRouter<ExtendedRequest<AvalonRequest, Params>, NextApiResponse> {
    if (params?.length > 0) {
        return createRouter().use(middleware);
    }
    return createRouter().use(middleware);
}
