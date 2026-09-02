import { FormEvent, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  Clock,
  Edit3,
  Home,
  IdCard,
  ImagePlus,
  Inbox,
  KeyRound,
  Laptop,
  MapPin,
  MessageCircle,
  PackageCheck,
  PackageOpen,
  Plus,
  Search,
  Send,
  Smartphone,
  Tag,
  Trash2,
  UserCheck,
  Wallet,
  Watch,
  X,
  XCircle,
} from "lucide-react";
import api from "../services/api";
import FloatingBackButton from "../components/FloatingBackButton";

type ItemType = "Lost" | "Found";
type ViewTab = "All" | ItemType | "My Reports";

type LostFoundItem = {
  id: number;
  name: string;
  type: ItemType;
  category: string;
  location: string;
  date: string;
  time: string;
  status: string;
  urgent: boolean;
  image: string;
  description: string;
  contact: string;
  owner: string;
  reward?: string;
  createdBy: "Demo" | "You";
};

type ReportForm = {
  name: string;
  category: string;
  description: string;
  location: string;
  date: string;
  time: string;
  contact: string;
  reward: string;
  urgent: boolean;
  image: string;
};

const categories = ["Phone", "Bag", "ID Card", "Watch", "Book", "Laptop", "Keys", "Wallet", "Calculator", "Others"];
const locations = ["Library", "Cafeteria", "Room 501", "Gate-2", "CSE Building", "Auditorium", "Security Office"];
const fallbackImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

const demoItems: LostFoundItem[] = [
  {
    id: 1,
    name: "iPhone 13",
    type: "Lost",
    category: "Phone",
    location: "Library",
    date: "2026-08-07",
    time: "2 Hours Ago",
    status: "Searching",
    urgent: true,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80",
    description: "Blue phone with transparent case. Last seen near the library reading table.",
    contact: "01700-123456",
    owner: "Shamim",
    reward: "500 Tk",
    createdBy: "Demo",
  },
  {
    id: 2,
    name: "Black Backpack",
    type: "Found",
    category: "Bag",
    location: "Cafeteria",
    date: "2026-08-07",
    time: "Today",
    status: "Open",
    urgent: false,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    description: "Black backpack found beside the cafeteria counter. Claim with proof of contents.",
    contact: "rakib@campus.edu",
    owner: "Rakib",
    createdBy: "Demo",
  },
  {
    id: 3,
    name: "Student ID Card",
    type: "Lost",
    category: "ID Card",
    location: "Gate-2",
    date: "2026-08-06",
    time: "Yesterday",
    status: "Searching",
    urgent: true,
    image: "https://images.unsplash.com/photo-1586996292898-71f4036c4e07?auto=format&fit=crop&w=900&q=80",
    description: "BUBT student ID card. Please message before sharing the full ID number.",
    contact: "student@campus.edu",
    owner: "Nusrat",
    createdBy: "Demo",
  },
  {
    id: 4,
    name: "Scientific Calculator",
    type: "Found",
    category: "Calculator",
    location: "Room 501",
    date: "2026-08-06",
    time: "Yesterday",
    status: "Claimed",
    urgent: false,
    image: "https://images.unsplash.com/photo-1616628182506-0b30f4f4234d?auto=format&fit=crop&w=900&q=80",
    description: "Calculator found after CT exam. Model details will be verified before return.",
    contact: "cr-cse@campus.edu",
    owner: "Rakib",
    createdBy: "Demo",
  },
];

const emptyForm: ReportForm = {
  name: "",
  category: "Phone",
  description: "",
  location: "Library",
  date: "",
  time: "",
  contact: "",
  reward: "",
  urgent: false,
  image: "",
};

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`lf-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, ReactNode> = {
    Phone: <Smartphone size={18} />,
    Bag: <Briefcase size={18} />,
    "ID Card": <IdCard size={18} />,
    Watch: <Watch size={18} />,
    Book: <BookOpen size={18} />,
    Laptop: <Laptop size={18} />,
    Keys: <KeyRound size={18} />,
    Wallet: <Wallet size={18} />,
  };
  return icons[category] || <PackageOpen size={18} />;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long" });
}

export default function LostFound() {
  const [items, setItems] = useState<LostFoundItem[]>(demoItems);
  const [activeTab, setActiveTab] = useState<ViewTab>("All");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [dateFilter, setDateFilter] = useState("Any Date");
  const [statusFilter, setStatusFilter] = useState("Any Status");
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [reportType, setReportType] = useState<ItemType>("Lost");
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [notice, setNotice] = useState("Demo: choose + Report, submit a lost/found item, then check My Reports.");
  const [claimText, setClaimText] = useState("");
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState([
    { by: "Finder", text: "I found this item near the campus library." },
    { by: "Owner", text: "I can verify it with hidden details." },
  ]);
  const [form, setForm] = useState<ReportForm>({
    ...emptyForm,
    name: "Demo Wallet",
    category: "Wallet",
    description: "Contains student ID and money. This sample shows how to write a report.",
    contact: "demo@campus.edu",
    reward: "500 Tk",
  });

  const stats = useMemo(() => {
    const lost = items.filter((item) => item.type === "Lost").length;
    const found = items.filter((item) => item.type === "Found").length;
    const returned = items.filter((item) => ["Claimed", "Returned", "Closed"].includes(item.status)).length;
    return { lost, found, returned };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const tabMatch =
        activeTab === "All" ||
        item.type === activeTab ||
        (activeTab === "My Reports" && item.createdBy === "You");
      const categoryMatch = category === "All Categories" || item.category === category;
      const locationMatch = location === "All Locations" || item.location === location;
      const statusMatch = statusFilter === "Any Status" || item.status === statusFilter;
      const itemDate = new Date(item.date);
      const today = new Date();
      const daysAgo = Math.floor((today.getTime() - itemDate.getTime()) / 86400000);
      const dateMatch = dateFilter === "Any Date" || (dateFilter === "Today" && daysAgo === 0) || (dateFilter === "This Week" && daysAgo <= 7);
      const queryMatch = !q || [item.name, item.category, item.location, item.description].some((value) => value.toLowerCase().includes(q));
      return tabMatch && categoryMatch && locationMatch && statusMatch && dateMatch && queryMatch;
    });
  }, [activeTab, category, dateFilter, items, location, query, statusFilter]);

  const recentLost = items.filter((item) => item.type === "Lost").slice(0, 3);
  const recentFound = items.filter((item) => item.type === "Found").slice(0, 3);
  const urgentItems = items.filter((item) => item.urgent).slice(0, 5);
  const myReports = items.filter((item) => item.createdBy === "You");

  function openReport(type: ItemType) {
    setReportType(type);
    setReportOpen(true);
    setReportMenuOpen(false);
  }

  function updateForm(key: keyof ReportForm, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) updateForm("image", URL.createObjectURL(file));
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.contact.trim()) {
      setNotice("Item Name, Description, and Contact are required.");
      return;
    }

    const newItem: LostFoundItem = {
      id: Date.now(),
      name: form.name.trim(),
      type: reportType,
      category: form.category,
      location: form.location,
      date: form.date || new Date().toISOString().slice(0, 10),
      time: form.time || "Just now",
      status: reportType === "Lost" ? "Searching" : "Open",
      urgent: form.urgent,
      image: form.image || fallbackImage,
      description: form.description.trim(),
      contact: form.contact.trim(),
      reward: reportType === "Lost" ? form.reward.trim() : undefined,
      owner: "You",
      createdBy: "You",
    };

    setItems((current) => [newItem, ...current]);
    setSelectedItem(newItem);
    setActiveTab("My Reports");
    setReportOpen(false);
    try {
      const reward = await api.post("leaderboard/award-action/", {
        action_key: "lost_item_returned",
        reference: `${reportType} ${newItem.name} #${newItem.id}`,
      });
      setNotice(`${reportType} report posted successfully. +${reward.data.points} points earned.`);
    } catch (error) {
      setNotice(`${reportType} report posted successfully. Points could not be awarded right now.`);
    }
    setForm({ ...emptyForm, category: form.category, location: form.location });
  }

  function deleteReport(id: number) {
    setItems((current) => current.filter((item) => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
    setNotice("Your report was deleted from this demo.");
  }

  function markClosed(id: number) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "Closed" } : item)));
    setNotice("Report marked as closed.");
  }

  function sendMessage() {
    if (!chatText.trim()) return;
    setMessages((current) => [...current, { by: "You", text: chatText.trim() }]);
    setChatText("");
  }

  function sendClaim() {
    if (!claimText.trim()) {
      setNotice("Claim needs proof. Add serial number, receipt, unlock pattern, or hidden detail.");
      return;
    }
    setNotice(`Claim request sent for ${selectedItem?.name}.`);
    setClaimText("");
  }

  return (
    <main className="lf-page">
      <FloatingBackButton />
      <style>{`
        .lf-page { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%); color: #111827; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .lf-shell { display: grid; grid-template-columns: 258px minmax(0, 1fr); gap: 22px; max-width: 1480px; margin: 0 auto; padding: 22px; }
        .lf-sidebar, .lf-card, .lf-panel, .lf-stat, .lf-modal-card { background: rgba(255,255,255,.96); border: 1px solid rgba(203,213,225,.76); border-radius: 8px; box-shadow: 0 18px 48px rgba(15,23,42,.07); }
        .lf-sidebar { position: sticky; top: 22px; height: calc(100vh - 44px); padding: 18px; display: flex; flex-direction: column; gap: 18px; }
        .lf-brand { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 900; }
        .lf-logo { width: 42px; height: 42px; border-radius: 8px; display: grid; place-items: center; color: white; background: linear-gradient(135deg, #0f172a, #2563eb); box-shadow: 0 14px 28px rgba(37,99,235,.28); }
        .lf-nav { display: grid; gap: 6px; }
        button { font: inherit; }
        .lf-nav button, .lf-tab, .lf-btn, .lf-chip, .lf-icon-btn { border: 0; cursor: pointer; }
        .lf-nav button { min-height: 42px; border-radius: 8px; display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: transparent; color: #64748b; font-weight: 750; text-align: left; }
        .lf-nav button.active, .lf-nav button:hover { background: #eef2ff; color: #2563eb; }
        .lf-guide { margin-top: auto; padding: 14px; border-radius: 8px; background: #f8fafc; color: #64748b; font-size: 13px; line-height: 1.5; border: 1px dashed #cbd5e1; }
        .lf-main { display: grid; gap: 18px; min-width: 0; }
        .lf-topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 58px; }
        .lf-title h1 { margin: 0; font-size: 34px; line-height: 1; letter-spacing: 0; }
        .lf-title p { margin: 5px 0 0; color: #64748b; }
        .lf-report-wrap { position: relative; }
        .lf-btn { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 15px; border-radius: 8px; background: #111827; color: #fff; font-weight: 850; box-shadow: 0 10px 22px rgba(15,23,42,.14); }
        .lf-btn.blue { background: #2563eb; }
        .lf-btn.green { background: #059669; }
        .lf-btn.soft { background: #f1f5f9; color: #334155; }
        .lf-btn.danger { background: #fee2e2; color: #b91c1c; }
        .lf-menu { position: absolute; right: 0; top: calc(100% + 8px); width: 220px; padding: 8px; z-index: 20; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 20px 50px rgba(15,23,42,.14); }
        .lf-menu button { width: 100%; display: flex; align-items: center; gap: 10px; border: 0; border-radius: 8px; padding: 11px 12px; background: transparent; text-align: left; cursor: pointer; font-weight: 800; color: #334155; }
        .lf-menu button:hover { background: #f8fafc; }
        .lf-searchbar { padding: 16px; display: grid; gap: 13px; }
        .lf-search { display: flex; align-items: center; gap: 10px; min-height: 50px; padding: 0 14px; border: 1px solid #dbe3ee; border-radius: 8px; background: white; box-shadow: inset 0 1px 0 rgba(255,255,255,.85); }
        .lf-search input, .lf-select select, .lf-field input, .lf-field select, .lf-field textarea { width: 100%; border: 0; outline: 0; background: transparent; color: #111827; font: inherit; }
        .lf-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .lf-tab { min-height: 38px; padding: 8px 14px; border-radius: 8px; background: #f1f5f9; color: #64748b; font-weight: 850; }
        .lf-tab.active { background: #111827; color: white; }
        .lf-filter-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
        .lf-select { min-height: 42px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid #dbe3ee; border-radius: 8px; background: white; color: #64748b; }
        .lf-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .lf-stat { padding: 18px; display: flex; align-items: center; gap: 13px; overflow: hidden; position: relative; }
        .lf-stat:after { content: ""; position: absolute; inset: auto 14px 0 auto; width: 70px; height: 4px; border-radius: 999px; background: #e2e8f0; }
        .lf-stat-icon { width: 44px; height: 44px; border-radius: 8px; display: grid; place-items: center; }
        .lf-stat strong { display: block; font-size: 26px; line-height: 1; }
        .lf-stat span { color: #64748b; font-size: 13px; font-weight: 800; }
        .lf-grid-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .lf-panel { padding: 17px; }
        .lf-section-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .lf-section-title h2 { margin: 0; font-size: 18px; letter-spacing: 0; }
        .lf-list { display: grid; gap: 10px; }
        .lf-mini-item { display: grid; grid-template-columns: 42px minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 11px; border-radius: 8px; background: #f8fafc; border: 1px solid #edf2f7; text-align: left; color: inherit; }
        .lf-mini-icon { width: 42px; height: 42px; border-radius: 8px; display: grid; place-items: center; background: white; color: #2563eb; border: 1px solid #e5e7eb; }
        .lf-mini-item strong, .lf-card h3 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lf-mini-item p { margin: 3px 0 0; color: #64748b; font-size: 13px; }
        .lf-feed { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .lf-card { overflow: hidden; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .lf-card:hover { transform: translateY(-3px); border-color: #bfdbfe; box-shadow: 0 20px 48px rgba(37,99,235,.13); }
        .lf-card img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; background: #e5e7eb; }
        .lf-card-body { padding: 14px; display: grid; gap: 10px; }
        .lf-card h3 { margin: 0; font-size: 17px; }
        .lf-badge { width: fit-content; display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 999px; font-size: 12px; font-weight: 900; }
        .lf-badge.lost { color: #b91c1c; background: #fee2e2; }
        .lf-badge.found { color: #047857; background: #d1fae5; }
        .lf-meta { display: flex; flex-wrap: wrap; gap: 8px 12px; color: #64748b; font-size: 13px; }
        .lf-meta span { display: inline-flex; align-items: center; gap: 4px; }
        .lf-chip-row { display: flex; flex-wrap: wrap; gap: 9px; }
        .lf-chip { display: inline-flex; align-items: center; gap: 7px; padding: 9px 11px; border-radius: 8px; background: #f8fafc; color: #334155; border: 1px solid #e5e7eb; font-weight: 800; }
        .lf-note { padding: 12px 14px; border-radius: 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-weight: 800; }
        .lf-report-list { display: grid; gap: 10px; }
        .lf-report-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px; border-radius: 8px; background: #f8fafc; border: 1px solid #e5e7eb; }
        .lf-report-row h3 { margin: 0 0 4px; font-size: 16px; }
        .lf-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
        .lf-modal { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 20px; background: rgba(15,23,42,.42); backdrop-filter: blur(14px); }
        .lf-modal-card { width: min(980px, 100%); max-height: calc(100vh - 40px); overflow: auto; padding: 0; border-color: rgba(226,232,240,.92); box-shadow: 0 34px 90px rgba(15,23,42,.28); }
        .lf-modal-head { padding: 18px 18px 14px; border-bottom: 1px solid #eef2f7; }
        .lf-modal-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .lf-icon-btn { width: 38px; height: 38px; border-radius: 8px; display: grid; place-items: center; background: #f1f5f9; color: #334155; }
        .lf-detail-layout { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 18px; padding: 18px; }
        .lf-detail-image { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 8px; background: #e5e7eb; box-shadow: 0 20px 48px rgba(15,23,42,.12); }
        .lf-detail-block { display: grid; gap: 12px; align-content: start; }
        .lf-detail-block h2 { margin: 0; font-size: 27px; }
        .lf-muted { color: #64748b; font-size: 13px; line-height: 1.5; }
        .lf-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .lf-report-layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 0; }
        .lf-report-side { padding: 20px; background: #0f172a; color: white; display: grid; align-content: space-between; gap: 22px; min-height: 560px; }
        .lf-report-side h3 { margin: 14px 0 8px; font-size: 24px; line-height: 1.1; letter-spacing: 0; }
        .lf-report-side p { margin: 0; color: rgba(255,255,255,.72); line-height: 1.6; }
        .lf-report-preview { border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); }
        .lf-report-preview img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; }
        .lf-report-preview div { padding: 12px; }
        .lf-report-preview strong { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lf-report-form { padding: 18px; background: #fbfdff; }
        .lf-field { display: grid; gap: 7px; color: #475569; font-size: 13px; font-weight: 850; }
        .lf-field input, .lf-field select, .lf-field textarea { min-height: 44px; padding: 10px 12px; border: 1px solid #d6e0eb; border-radius: 8px; background: white; font-weight: 720; box-shadow: 0 1px 0 rgba(15,23,42,.02); }
        .lf-field input:focus, .lf-field select:focus, .lf-field textarea:focus, .lf-search:focus-within, .lf-select:focus-within { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,.10); }
        .lf-field textarea { min-height: 106px; resize: vertical; }
        .lf-field.wide { grid-column: 1 / -1; }
        .lf-full { grid-column: 1 / -1; width: 100%; }
        .lf-check { display: flex; gap: 8px; align-items: center; color: #475569; font-weight: 800; }
        .lf-chat { display: grid; gap: 8px; }
        .lf-bubble { max-width: 88%; padding: 10px 12px; border-radius: 8px; background: #f1f5f9; font-size: 14px; }
        .lf-bubble.you { margin-left: auto; background: #2563eb; color: white; }
        .lf-chat-send { display: grid; grid-template-columns: minmax(0,1fr) 42px; gap: 8px; }
        .lf-soft-box { padding: 14px; border-radius: 8px; background: #f8fafc; border: 1px solid #e5e7eb; }
        @media (max-width: 1120px) { .lf-feed { grid-template-columns: repeat(2, minmax(0, 1fr)); } .lf-grid-two { grid-template-columns: 1fr; } }
        @media (max-width: 860px) { .lf-shell { grid-template-columns: 1fr; padding: 12px; } .lf-sidebar { position: static; height: auto; } .lf-filter-row, .lf-stats, .lf-feed, .lf-form-grid, .lf-detail-layout, .lf-report-layout { grid-template-columns: 1fr; } .lf-topbar { align-items: flex-start; } .lf-report-side { min-height: auto; } }
        @media (max-width: 560px) { .lf-topbar, .lf-report-row { grid-template-columns: 1fr; display: grid; } .lf-actions { justify-content: flex-start; } .lf-title h1 { font-size: 25px; } }
      `}</style>

      <div className="lf-shell">
        <aside className="lf-sidebar">
          <div className="lf-brand">
            <div className="lf-logo"><PackageOpen size={22} /></div>
            <span>Lost & Found</span>
          </div>
          <nav className="lf-nav">
            {[
              [Home, "Home", "All"],
              [Search, "Browse Items", "All"],
              [XCircle, "Lost Items", "Lost"],
              [CheckCircle2, "Found Items", "Found"],
              [Inbox, "My Reports", "My Reports"],
              [MessageCircle, "Messages", "All"],
              [Bell, "Notifications", "All"],
            ].map(([Icon, label, target]) => (
              <button className={(label === "Home" && activeTab === "All") || (target !== "All" && activeTab === target) ? "active" : ""} key={label} onClick={() => setActiveTab(target as ViewTab)}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
          <div className="lf-guide">
            <strong>Demo flow</strong>
            <br />
            Click + Report, submit a report, open My Reports, then edit status or delete.
          </div>
        </aside>

        <section className="lf-main">
          <header className="lf-topbar">
            <div className="lf-title">
              <h1>Lost & Found</h1>
              <p>Clean campus recovery board with reporting, claiming, chat, and personal report tracking.</p>
            </div>
            <div className="lf-report-wrap">
              <button className="lf-btn" onClick={() => setReportMenuOpen((open) => !open)}>
                <Plus size={18} /> Report <ChevronDown size={16} />
              </button>
              {reportMenuOpen && (
                <div className="lf-menu">
                  <button onClick={() => openReport("Lost")}><XCircle size={18} color="#dc2626" /> Lost Item</button>
                  <button onClick={() => openReport("Found")}><CheckCircle2 size={18} color="#059669" /> Found Item</button>
                </div>
              )}
            </div>
          </header>

          <section className="lf-panel lf-searchbar">
            <div className="lf-search">
              <Search size={20} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lost items..." />
            </div>
            <div className="lf-tabs">
              {(["All", "Lost", "Found", "My Reports"] as const).map((tab) => (
                <button className={`lf-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>
              ))}
            </div>
            <div className="lf-filter-row">
              <div className="lf-select"><Tag size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All Categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="lf-select"><MapPin size={16} /><select value={location} onChange={(event) => setLocation(event.target.value)}><option>All Locations</option>{locations.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="lf-select"><CalendarDays size={16} /><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option>Any Date</option><option>Today</option><option>This Week</option></select></div>
              <div className="lf-select"><CircleCheck size={16} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Any Status</option><option>Searching</option><option>Open</option><option>Claimed</option><option>Closed</option></select></div>
            </div>
          </section>

          <section className="lf-stats">
            <div className="lf-stat"><div className="lf-stat-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><XCircle /></div><div><strong>{stats.lost}</strong><span>Lost</span></div></div>
            <div className="lf-stat"><div className="lf-stat-icon" style={{ background: "#dcfce7", color: "#059669" }}><CheckCircle2 /></div><div><strong>{stats.found}</strong><span>Found</span></div></div>
            <div className="lf-stat"><div className="lf-stat-icon" style={{ background: "#dbeafe", color: "#2563eb" }}><CircleCheck /></div><div><strong>{stats.returned}</strong><span>Returned</span></div></div>
          </section>

          <section className="lf-grid-two">
            <div className="lf-panel">
              <div className="lf-section-title"><h2>Recent Lost Items</h2><XCircle size={18} color="#dc2626" /></div>
              <div className="lf-list">
                {recentLost.map((item) => (
                  <button className="lf-mini-item" key={item.id} onClick={() => setSelectedItem(item)}>
                    <div className="lf-mini-icon"><CategoryIcon category={item.category} /></div>
                    <div><strong>{item.name}</strong><p><MapPin size={12} /> {item.location} · {item.time}</p></div>
                    <span className="lf-badge lost">View</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="lf-panel">
              <div className="lf-section-title"><h2>Recently Found</h2><CheckCircle2 size={18} color="#059669" /></div>
              <div className="lf-list">
                {recentFound.map((item) => (
                  <button className="lf-mini-item" key={item.id} onClick={() => setSelectedItem(item)}>
                    <div className="lf-mini-icon"><CategoryIcon category={item.category} /></div>
                    <div><strong>{item.name}</strong><p><MapPin size={12} /> {item.location} · {item.time}</p></div>
                    <span className="lf-badge found">Claim</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="lf-panel">
            <div className="lf-section-title"><h2>Urgent Items</h2><Bell size={18} color="#f59e0b" /></div>
            <div className="lf-chip-row">
              {urgentItems.map((item) => (
                <button className="lf-chip" key={item.id} onClick={() => setSelectedItem(item)}>
                  <CategoryIcon category={item.category} /> {item.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="lf-section-title">
              <h2>{activeTab === "My Reports" ? "My Reports" : "Item Feed"}</h2>
              <span className="lf-muted">{filteredItems.length} items</span>
            </div>
            {activeTab === "My Reports" ? (
              <div className="lf-report-list">
                <div className="lf-note">{notice}</div>
                {myReports.length === 0 ? (
                  <div className="lf-panel"><p className="lf-muted">No personal reports yet. Use + Report to post a demo lost/found item.</p></div>
                ) : myReports.map((item) => (
                  <div className="lf-report-row" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <div className="lf-meta"><span>{item.type}</span><span>{item.status}</span><span><MapPin size={13} /> {item.location}</span></div>
                    </div>
                    <div className="lf-actions">
                      <button className="lf-btn soft" onClick={() => setSelectedItem(item)}><Edit3 size={16} /> Edit</button>
                      <button className="lf-btn soft" onClick={() => markClosed(item.id)}><CircleCheck size={16} /> Close</button>
                      <button className="lf-btn danger" onClick={() => deleteReport(item.id)}><Trash2 size={16} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lf-feed">
                {filteredItems.map((item) => (
                  <article className="lf-card" key={item.id} onClick={() => setSelectedItem(item)}>
                    <img src={item.image} alt={item.name} />
                    <div className="lf-card-body">
                      <span className={`lf-badge ${item.type.toLowerCase()}`}>{item.type === "Lost" ? <XCircle size={13} /> : <CheckCircle2 size={13} />} {item.type}</span>
                      <h3>{item.name}</h3>
                      <div className="lf-meta">
                        <span><MapPin size={13} /> {item.location}</span>
                        <span><Clock size={13} /> {item.time}</span>
                      </div>
                      <button className={`lf-btn ${item.type === "Found" ? "green" : "blue"}`}>{item.type === "Found" ? "Claim" : "View Details"}</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>

      {selectedItem && (
        <div className="lf-modal" onClick={() => setSelectedItem(null)}>
          <section className="lf-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="lf-modal-head">
              <div>
                <span className={`lf-badge ${selectedItem.type.toLowerCase()}`}>{selectedItem.type}</span>
                <h2 style={{ margin: "8px 0 0" }}>{selectedItem.type} Item Details</h2>
              </div>
              <button className="lf-icon-btn" onClick={() => setSelectedItem(null)} aria-label="Close details"><X size={18} /></button>
            </div>
            <div className="lf-detail-layout">
              <img className="lf-detail-image" src={selectedItem.image} alt={selectedItem.name} />
              <div className="lf-detail-block">
                <h2>{selectedItem.name}</h2>
                <div className="lf-meta">
                  <span><Tag size={14} /> {selectedItem.category}</span>
                  <span><MapPin size={14} /> {selectedItem.location}</span>
                  <span><CalendarDays size={14} /> {formatDate(selectedItem.date)}</span>
                  <span><CircleCheck size={14} /> {selectedItem.status}</span>
                </div>
                <p className="lf-muted">{selectedItem.description}</p>
                {selectedItem.type === "Lost" && selectedItem.reward && <div className="lf-note">Reward: {selectedItem.reward}</div>}
                <div className="lf-grid-two">
                  <div className="lf-soft-box">
                    <strong>{selectedItem.type === "Lost" ? "Owner" : "Found By"}</strong>
                    <p className="lf-muted">{selectedItem.owner}<br />{selectedItem.contact}</p>
                    <div className="lf-actions" style={{ justifyContent: "flex-start" }}>
                      <button className="lf-btn blue"><MessageCircle size={17} /> Message</button>
                      <button className="lf-btn green"><UserCheck size={17} /> Claim</button>
                    </div>
                  </div>
                  <div className="lf-soft-box">
                    <strong>Claim Item</strong>
                    <Field label="Proof" wide><textarea value={claimText} onChange={(event) => setClaimText(event.target.value)} placeholder="Serial number, unlock pattern, receipt, or hidden detail" /></Field>
                    <button className="lf-btn" onClick={sendClaim}><Send size={17} /> Send Claim</button>
                  </div>
                </div>
                <div className="lf-soft-box">
                  <div className="lf-section-title"><h2>Messages</h2><MessageCircle size={18} /></div>
                  <div className="lf-chat">
                    {messages.map((message, index) => (
                      <div className={`lf-bubble ${message.by === "You" ? "you" : ""}`} key={`${message.by}-${index}`}>
                        <strong>{message.by}</strong><br />{message.text}
                      </div>
                    ))}
                  </div>
                  <div className="lf-chat-send" style={{ marginTop: 10 }}>
                    <div className="lf-search"><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Write message..." /></div>
                    <button className="lf-btn" onClick={sendMessage} aria-label="Send message"><Send size={17} /></button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {reportOpen && (
        <div className="lf-modal" onClick={() => setReportOpen(false)}>
          <section className="lf-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="lf-modal-head">
              <div>
                <span className={`lf-badge ${reportType.toLowerCase()}`}>{reportType}</span>
                <h2 style={{ margin: "8px 0 0" }}>Report {reportType} Item</h2>
              </div>
              <button className="lf-icon-btn" onClick={() => setReportOpen(false)} aria-label="Close report form"><X size={18} /></button>
            </div>
            <div className="lf-report-layout">
              <aside className="lf-report-side">
                <div>
                  <span className={`lf-badge ${reportType.toLowerCase()}`}>{reportType}</span>
                  <h3>{reportType === "Lost" ? "Tell campus what went missing." : "Help the owner find this item."}</h3>
                  <p>Use clear public details. Keep private proof like serial numbers, full ID numbers, or unlock patterns for claim verification.</p>
                </div>
                <div className="lf-report-preview">
                  <img src={form.image || fallbackImage} alt="Report preview" />
                  <div>
                    <strong>{form.name || "Item preview"}</strong>
                    <p>{form.location} - {form.category}</p>
                  </div>
                </div>
              </aside>
              <form className="lf-form-grid lf-report-form" onSubmit={submitReport}>
                <Field label="Item Name"><input value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Wallet, Phone, Calculator" /></Field>
                <Field label="Category"><select value={form.category} onChange={(event) => updateForm("category", event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Description" wide><textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Contains Student ID and money. Add useful details, keep private proof hidden." /></Field>
                <Field label={reportType === "Lost" ? "Location" : "Found Location"}><select value={form.location} onChange={(event) => updateForm("location", event.target.value)}>{locations.map((item) => <option key={item}>{item}</option>)}</select></Field>
                <Field label={reportType === "Lost" ? "Date" : "Found Date"}><input value={form.date} onChange={(event) => updateForm("date", event.target.value)} type="date" /></Field>
                <Field label="Approximate Time"><input value={form.time} onChange={(event) => updateForm("time", event.target.value)} placeholder="2 Hours Ago / 3:30 PM" /></Field>
                <Field label="Upload Images"><input onChange={handleImage} type="file" accept="image/*" /></Field>
                {reportType === "Lost" && <Field label="Reward"><input value={form.reward} onChange={(event) => updateForm("reward", event.target.value)} placeholder="500 Tk, Optional" /></Field>}
                <Field label="Phone / Email"><input value={form.contact} onChange={(event) => updateForm("contact", event.target.value)} placeholder="Phone or email" /></Field>
                <label className="lf-check"><input checked={form.urgent} onChange={(event) => updateForm("urgent", event.target.checked)} type="checkbox" /> Mark urgent</label>
                <button className="lf-btn lf-full" type="submit"><Send size={18} /> Submit Report</button>
              </form>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
