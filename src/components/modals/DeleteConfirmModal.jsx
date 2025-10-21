const DeleteConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border-2 border-zinc-800 p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-red-500 mb-6 tracking-wider">DELETE DECK?</h2>
        <p className="text-zinc-400 mb-8 text-lg">
          Are you sure you want to delete this deck? This action cannot be undone.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-zinc-950 border-2 border-zinc-800 hover:border-zinc-700 text-white px-6 py-3 transition font-bold tracking-wide"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-zinc-950 border-2 border-red-600 hover:bg-red-600 text-white px-6 py-3 transition font-bold tracking-wide"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
