const AlertModal = ({ isOpen, onClose, onAlertSent }) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("CRITICAL");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) return toast.warning("Please type a message");

    setLoading(true);
    const { error } = await createAlertAPI(message, type);
    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Broadcast alert sent to Receptionist!");
      onAlertSent(); 
      onClose();
      setMessage(""); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* ... Header stays the same ... */}

        <div className="space-y-4"> {/* Just a <div> instead of a <form> */}
          {/* ... Inputs stay the same ... */}

          <button
            onClick={handleSend} // 2. Direct onClick call
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 py-3 font-bold text-white shadow-lg transition-all hover:bg-orange-700 disabled:bg-gray-300"
          >
            {loading ? "Sending..." : "SEND TO RECEPTIONIST"}
          </button>
        </div>
      </div>
    </div>
  );
};
