import ComplaintDetail from "../components/ComplaintDetail";
import ResolutionForm from "../components/ResolutionForm";

export default function ComplaintViewPage({
  complaint,
  isResolving,
  onResolveSuccess,
  onBack,
  onVerify,
  onReopen,
  onDelete,
}) {
  if (isResolving) {
    return <ResolutionForm complaint={complaint} onSuccess={onResolveSuccess} />;
  }

  return (
    <ComplaintDetail
      complaint={complaint}
      onBack={onBack}
      onVerify={onVerify}
      onReopen={onReopen}
      onDelete={onDelete}
    />
  );
}
