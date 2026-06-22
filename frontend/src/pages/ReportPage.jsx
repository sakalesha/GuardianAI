import ReportForm from "../components/ReportForm";

export default function ReportPage({ onNewReport }) {
  return (
    <div className="max-w-3xl mx-auto">
      <ReportForm onSuccess={onNewReport} />
    </div>
  );
}
