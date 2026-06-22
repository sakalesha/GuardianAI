import ComplaintList from "../components/ComplaintList";

export default function ReportsPage({ complaints, onSelectComplaint }) {
  return (
    <div
      onClick={(e) => {
        if (!(e.target instanceof Element)) return;
        const card = e.target.closest("[data-complaint-id]");
        if (card) {
          const id = card.getAttribute("data-complaint-id");
          const found = complaints.find((c) => c.id === id);
          if (found) onSelectComplaint(found);
        }
      }}
    >
      <ComplaintList complaints={complaints} />
    </div>
  );
}
