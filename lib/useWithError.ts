import { useSnackbar } from 'notistack';

type OptionalError = Promise<string | null> | string | null;
type Handler = () => Promise<void>;
type WithError = (f: () => OptionalError) => Handler;

export default function useWithError(): WithError {
    const { enqueueSnackbar } = useSnackbar();

    return (f: () => OptionalError) => {
        const handler = async () => {
            const out = await f();
            if (typeof out === 'string') {
                enqueueSnackbar(out, { variant: 'error' });
            }
        };
        return handler;
    };
}
