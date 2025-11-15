import React, { useState } from 'react';
import Modal from './Modal';
import { MailIcon, SmsIcon, VideoCameraIcon, CopyIcon, CheckIcon } from '../icons';

interface ShareSessionModalProps {
  sessionId: string;
  onClose: () => void;
}

const ShareSessionModal: React.FC<ShareSessionModalProps> = ({ sessionId, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}#sessionId=${sessionId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleEmailShare = () => {
    window.open(`mailto:?subject=Join my SMEPro Session&body=You can join my collaborative AI session using this link: ${shareUrl}`);
  };

  const handleTextShare = () => {
     window.open(`sms:?&body=Join my SMEPro Session: ${shareUrl}`);
  };

  const handleMeetShare = () => {
    alert("In a real app, this would generate and open a Google Meet link for a screen-sharing session.");
    // Example: window.open('https://meet.google.com/new', '_blank');
  };

  const ShareButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-2 p-4 w-full bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );

  return (
    <Modal title="Share Session" onClose={onClose}>
      <div className="space-y-6">
        <p className="text-slate-400 text-center">
          Share this session with others to collaborate in real-time or continue on another device.
        </p>

        <div className="grid grid-cols-2 gap-4">
            <ShareButton icon={<MailIcon className="w-8 h-8" />} label="Share via Email" onClick={handleEmailShare} />
            <ShareButton icon={<SmsIcon className="w-8 h-8" />} label="Share via Text" onClick={handleTextShare} />
            <ShareButton icon={<VideoCameraIcon className="w-8 h-8" />} label="Start Video Call" onClick={handleMeetShare} />
            <div className="col-span-2">
                 <div className="relative">
                    <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pr-24 text-slate-400 text-sm"
                    />
                    <button
                        onClick={handleCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md text-sm font-semibold"
                    >
                        {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareSessionModal;