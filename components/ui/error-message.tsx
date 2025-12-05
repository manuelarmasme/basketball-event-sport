export default function ErrorMessage({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return <div className="text-red-600 text-sm italic">{errorMessage}</div>;
}
