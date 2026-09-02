import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Send, User, Clock, ArrowLeft, Package, Check, X } from "lucide-react";
import api from "../../services/api";

export default function MarketplaceChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const userId = localStorage.getItem("user_id"); // Assuming user_id is in localStorage or auth context

  useEffect(() => {
    fetchConversations();
    // If started from ItemDetails with state
    if (location.state?.activeConv) {
      setActiveConv(location.state.activeConv);
      // Remove it from state so refreshing doesn't get stuck
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      fetchOffers(activeConv.item); // Fetch offers related to this item for this buyer/seller pair
      
      const interval = setInterval(() => {
        fetchMessages(activeConv.id, true);
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('marketplace/conversations/');
      setConversations(res.data);
      if (res.data.length > 0 && !activeConv) {
        setActiveConv(res.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId, silent = false) => {
    try {
      const res = await api.get(`marketplace/messages/?conversation=${convId}`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const fetchOffers = async (itemId) => {
    try {
       // Filter offers by this item and buyer (if current user is buyer, it's just them. If seller, they see all offers for this item from this buyer)
       // Since the conversation implies a specific buyer/seller pair, we can fetch offers where item = itemId. 
       // The backend should ideally filter by buyer too if we pass it, but for simplicity let's fetch for the item and filter client-side.
       const res = await api.get(`marketplace/offers/?item=${itemId}`);
       // activeConv.buyer is the buyer ID
       const relevantOffers = res.data.filter(o => o.buyer === activeConv.buyer || o.buyer === activeConv.seller);
       setOffers(relevantOffers);
    } catch (e) {
       console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    
    try {
      const res = await api.post('marketplace/messages/', {
        conversation: activeConv.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
      
      // Update last_message in conversation list locally
      setConversations(conversations.map(c => 
        c.id === activeConv.id ? { ...c, last_message_content: res.data.content, updated_at: res.data.created_at } : c
      ));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptOffer = async (offerId) => {
      try {
          await api.post(`marketplace/offers/${offerId}/update_status/`, { status: 'accepted' });
          fetchOffers(activeConv.item);
          // Auto send a message
          await api.post('marketplace/messages/', {
              conversation: activeConv.id,
              content: "I have accepted your offer! Let's decide on a time and place to meet."
          });
          fetchMessages(activeConv.id);
      } catch (e) { console.error(e); }
  };
  
  const handleRejectOffer = async (offerId) => {
      try {
          await api.post(`marketplace/offers/${offerId}/update_status/`, { status: 'rejected' });
          fetchOffers(activeConv.item);
      } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto bg-white border-x border-gray-200">
      
      {/* Conversations List Sidebar */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p>No conversations yet.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors ${activeConv?.id === conv.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 truncate pr-2">
                    {conv.item_title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">
                  With {conv.buyer === Number(userId) ? conv.seller_name : conv.buyer_name}
                </p>
                <p className="text-xs text-gray-500 truncate italic">
                  {conv.last_message_content || "No messages yet"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConv(null)}
                  className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {activeConv.buyer === Number(userId) ? activeConv.seller_name : activeConv.buyer_name}
                  </h3>
                  <Link to={`/marketplace/item/${activeConv.item}`} className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                    <Package size={14} /> {activeConv.item_title}
                  </Link>
                </div>
              </div>
            </div>

            {/* Offers Banner */}
            {offers.filter(o => o.status === 'pending').length > 0 && (
              <div className="bg-orange-100 border-b border-orange-200 p-3 px-4 shadow-sm">
                 {offers.filter(o => o.status === 'pending').map(offer => (
                    <div key={offer.id} className="flex items-center justify-between">
                        <div className="text-sm text-orange-900">
                            <strong>{offer.buyer === Number(userId) ? 'You' : activeConv.buyer_name}</strong> made an offer of <strong>৳{offer.amount}</strong>
                        </div>
                        {offer.buyer !== Number(userId) ? (
                            <div className="flex gap-2">
                                <button onClick={() => handleAcceptOffer(offer.id)} className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-md"><Check size={16}/></button>
                                <button onClick={() => handleRejectOffer(offer.id)} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md"><X size={16}/></button>
                            </div>
                        ) : (
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-bold">Pending</span>
                        )}
                    </div>
                 ))}
              </div>
            )}
            
            {offers.filter(o => o.status === 'accepted').length > 0 && (
                <div className="bg-green-50 border-b border-green-200 p-3 px-4 shadow-sm text-sm text-green-800 flex items-center justify-between">
                    <span>Offer of <strong>৳{offers.filter(o => o.status === 'accepted')[0].amount}</strong> has been accepted!</span>
                    <Check size={16} className="text-green-600"/>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <MessageCircle size={28} className="text-orange-300" />
                  </div>
                  <p>Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender === Number(userId);
                  const showTime = index === 0 || (new Date(msg.created_at) - new Date(messages[index-1].created_at)) > 300000;
                  
                  return (
                    <div key={msg.id} className="space-y-1">
                      {showTime && (
                        <div className="text-center text-xs text-gray-400 my-4 flex items-center justify-center gap-2">
                           <Clock size={12}/> {new Date(msg.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' })}
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe 
                            ? 'bg-orange-500 text-white rounded-tr-sm shadow-sm' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-4 py-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none max-h-32"
                    rows={1}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-full p-3 transition-colors shadow-md flex-shrink-0 mb-1"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
            <MessageCircle size={64} className="mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Your Messages</h3>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
