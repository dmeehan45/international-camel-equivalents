import { uxCopy } from '../content/uxCopy';

type Props = {
  message: string;
  statute?: string;
};

export function ErrorMessage({ message, statute = uxCopy.errors.defaultStatute }: Props) {
  if (!message) return null;
  return (
    <p className="error error-banner" role="alert" aria-live="assertive">
      <strong>{statute}:</strong> {message}
    </p>
  );
}
