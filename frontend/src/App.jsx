import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import ComplaintViewPage from "./pages/ComplaintViewPage";
import AuthPage from "./pages/AuthPage";
import NotificationList from "./components/NotificationList";
import { useAuth } from "./contexts/AuthContext";
import { useNotifications } from "./contexts/NotificationContext";
import { SLA_HOURS } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { cn } from "./lib/utils";
import { complaintService } from "./services/api";
import AuthorityDashboardPage from "./pages/AuthorityDashboardPage";


export default function App() {
  const { user, loading, logout } = useAuth();
  const { addNotification, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState("map");
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handle "Separate URL" for Authority and Sharing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolveId = params.get("resolve");
    const viewId = params.get("view");
    if (resolveId) {
      const found = complaints.find((c) => c.id === resolveId);
      if (found) {
        setSelectedComplaint(found);
        setIsResolving(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (viewId) {
      const found = complaints.find((c) => c.id === viewId);
      if (found) {
        setSelectedComplaint(found);
        setIsResolving(false);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [complaints]);

  // Load from API
  useEffect(() => {
    complaintService.getComplaints().then(setComplaints).catch(console.error);
  }, []);

  const handleNewReport = async (report) => {
    try {
      const slaHours = SLA_HOURS[report.category || "Other"] || 72;
      const reportPayload = {
        ...report,
        userId: user?.uid || "anonymous",
        slaDeadline: new Date(
          Date.now() + slaHours * 60 * 60 * 1000,
        ).toISOString(),
      };
      const newComplaint =
        await complaintService.createComplaint(reportPayload);
      setComplaints([newComplaint, ...complaints]);
      setActiveTab("list");
    } catch (error) {
      console.error("Failed to create complaint:", error);
      alert("Failed to file complaint. Please try again later.");
    }
  };

  const handleUpdateComplaint = async (updated) => {
    if (!selectedComplaint) return;
    try {
      const oldStatus = selectedComplaint.status;
      const newStatus = updated.status;

      // Prepare payload and update backend
      const updatePayload = {
        ...updated,
        // History will be managed by the backend to avoid duplicate/conflicting entries
      };
      
      const savedComplaint = await complaintService.updateComplaintStatus(selectedComplaint.id, updatePayload);

      // Add notification and update local state
      if (newStatus && newStatus !== oldStatus) {
        addNotification(
          selectedComplaint.id,
          "STATUS_CHANGE",
          `Complaint ${selectedComplaint.id} status updated to ${newStatus}`,
          oldStatus,
          newStatus,
        );
      }

      const newComplaints = complaints.map((c) =>
        c.id === selectedComplaint.id ? savedComplaint : c,
      );
      
      setComplaints(newComplaints);
      setSelectedComplaint(savedComplaint);
      setIsResolving(false);
    } catch (error) {
      console.error("Failed to update complaint:", error);
      alert("Failed to save resolution. Please try again.");
    }
  };

  const handleReopenComplaint = async () => {
    if (!selectedComplaint) return;
    try {
      const updatedHistory = [
        ...(selectedComplaint.history || []),
        {
          status: "REOPENED",
          timestamp: new Date().toISOString(),
          user: user?.displayName || "Citizen",
          message: "Citizen disputed resolution. Reopening investigation.",
        },
      ];

      const updatePayload = {
        status: "REOPENED",
        history: updatedHistory,
        resolutionImageUrl: "", // Backend will unset if empty or we could use $unset, but empty string is fine
        resolutionTimestamp: "",
        verificationLabel: "",
        verificationScore: 0,
      };

      const savedComplaint = await complaintService.updateComplaintStatus(selectedComplaint.id, updatePayload);

      const newComplaints = complaints.map((c) =>
        c.id === selectedComplaint.id ? savedComplaint : c,
      );
      setComplaints(newComplaints);
      setSelectedComplaint(savedComplaint);

      addNotification(
        selectedComplaint.id,
        "STATUS_CHANGE",
        `Complaint ${selectedComplaint.id} has been REOPENED by citizen`,
        "RESOLVED",
        "REOPENED",
      );
    } catch (error) {
       console.error("Failed to reopen complaint:", error);
       alert("Failed to reopen complaint. Please try again.");
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!user) return;
    try {
      await complaintService.deleteComplaint(complaintId, user.uid);
      
      const newComplaints = complaints.filter((c) => c.id !== complaintId);
      setComplaints(newComplaints);
      setSelectedComplaint(null);
      
      addNotification(
        complaintId,
        "STATUS_CHANGE",
        `Complaint ${complaintId} has been deleted.`,
        "DELETED",
        "DELETED"
      );
    } catch (error) {
      console.error("Failed to delete complaint:", error);
      alert("Failed to delete complaint. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 className="animate-spin text-ink" size={48} />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const userInitials =
    user.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "??";

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar 
        user={user}
        userInitials={userInitials}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedComplaint={selectedComplaint}
        setSelectedComplaint={setSelectedComplaint}
        unreadCount={unreadCount}
        setIsNotificationsOpen={setIsNotificationsOpen}
        logout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden glass sticky top-0 z-50">
          <Header onOpenNotifications={() => setIsNotificationsOpen(true)} />
        </div>

        <main
          className={cn(
            "flex-1 overflow-y-auto",
            activeTab === "map"
              ? "p-0"
              : "px-6 py-10 md:px-16 md:py-16 max-w-7xl mx-auto w-full",
          )}
        >
          <AnimatePresence mode="wait">
            {selectedComplaint ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto"
              >
                <ComplaintViewPage 
                  complaint={selectedComplaint}
                  isResolving={isResolving}
                  onResolveSuccess={handleUpdateComplaint}
                  onBack={() => setSelectedComplaint(null)}
                  onVerify={() => setIsResolving(true)}
                  onReopen={handleReopenComplaint}
                  onDelete={handleDeleteComplaint}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                {activeTab === "map" && <MapPage complaints={complaints} />}
                {activeTab === "report" && user?.role === "CITIZEN" && <ReportPage onNewReport={handleNewReport} />}
                {activeTab === "list" && (user?.role === "CITIZEN" || user?.role === "WORKER") && <ReportsPage complaints={complaints} onSelectComplaint={setSelectedComplaint} />}
                {activeTab === "dashboard" && user?.role === "AUTHORITY" && <AuthorityDashboardPage complaints={complaints} onResolveSuccess={handleUpdateComplaint} />}
                {activeTab === "profile" && <ProfilePage user={user} userInitials={userInitials} logout={logout} complaints={complaints} />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <div className="md:hidden glass fixed bottom-0 left-0 right-0 z-50">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} userRole={user?.role} />
      </div>
      <NotificationList
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
