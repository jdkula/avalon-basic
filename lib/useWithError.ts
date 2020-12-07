import { useSnackbar } from 'notistack';

type OptionalError = Promise<string | null> | string | null;
type Handler<T> = (e: T) => Promise<void>;
type WithError = <T>(f: (e: T) => OptionalError) => Handler<T>;

export default function useWithError(): WithError {
    const { enqueueSnackbar } = useSnackbar();

    return <T>(f: (e: T) => OptionalError) => {
        const handler = async (e: T) => {
            const out = await f(e);
            if (typeof out === 'string') {
                enqueueSnackbar(out, { variant: 'error' });
            }
        };
        return handler;
    };
}
