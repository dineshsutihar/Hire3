import React from 'react';

interface ProfileModalProps {
    open: boolean;
    applicant: any;
    onClose: () => void;
    getStatusColor: (status: string) => string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, applicant, onClose, getStatusColor }) => {
    if (!open || !applicant) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white text-2xl"
                    aria-label="Close profile modal"
                >
                    &times;
                </button>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary mb-2">
                        {applicant.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{applicant.name}</h2>
                    <div className="text-muted-foreground mb-2">{applicant.email}</div>
                    <div className="flex flex-wrap gap-2 mb-2 justify-center">
                        {applicant.skills.map((skill: string) => (
                            <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-4 mb-2">
                        <div className="text-center">
                            <div className="text-xl font-semibold text-purple-700">{applicant.matchScore}%</div>
                            <div className="text-xs text-muted-foreground">Match Score</div>
                        </div>
                        <div className="text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(applicant.status)}`}>{applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}</span>
                            <div className="text-xs text-muted-foreground mt-1">Status</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
