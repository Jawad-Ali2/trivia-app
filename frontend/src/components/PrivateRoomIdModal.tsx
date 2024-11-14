import React, { useState } from "react";
import Modal from "./Modal"; // Adjust the import based on your actual Modal component path

interface PrivateRoomIdModalProps {
    roomId: string;
    isOpen: boolean;
    onClose: () => void;
}

const PrivateRoomIdModal: React.FC<PrivateRoomIdModalProps> = ({
    roomId,
    isOpen,
    onClose,
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const privateUrl = `${window.location.origin}/trivia?roomType=private&roomId=${roomId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(privateUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Share url with your friends!</h2>
                <p className="mb-4 font-mono text-sm">{privateUrl}</p>
                <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded ${
                        isCopied ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                    }`}
                >
                    {isCopied ? "Copied!" : "Copy Room ID"}
                </button>
            </div>
        </Modal>
    );
};

export default PrivateRoomIdModal;
