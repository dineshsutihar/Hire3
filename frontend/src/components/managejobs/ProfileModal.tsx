import React from 'react';
import Button from '../Button';
import {
    X,
    Mail,
    Star,
    CheckCircle,
    XCircle,
    Briefcase,
    MapPin,
    Calendar,
    ExternalLink,
    Copy,
    Download
} from 'lucide-react';

interface ProfileModalProps {
    open: boolean;
    applicant: any;
    onClose: () => void;
    getStatusColor: (status: string) => string;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, applicant, onClose, getStatusColor, onAccept, onReject }) => {
    const [copied, setCopied] = React.useState(false);

    if (!open || !applicant) return null;

    const copyEmail = () => {
        navigator.clipboard.writeText(applicant.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const getMatchScoreBg = (score: number) => {
        if (score >= 80) return 'from-green-500 to-green-600';
        if (score >= 50) return 'from-yellow-500 to-yellow-600';
        return 'from-gray-400 to-gray-500';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/60">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        aria-label="Close profile modal"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Avatar positioned at bottom of header */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-neutral-800 shadow-xl flex items-center justify-center text-3xl font-bold text-primary border-4 border-white dark:border-neutral-900">
                            {applicant.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 pb-6 px-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {/* Name and Status */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">{applicant.name}</h2>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${applicant.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                    applicant.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {applicant.status === 'accepted' && <CheckCircle className="h-4 w-4" />}
                                {applicant.status === 'rejected' && <XCircle className="h-4 w-4" />}
                                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Match Score Card */}
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Match Score</span>
                            <span className={`text-2xl font-bold ${getMatchScoreColor(applicant.matchScore || 0)}`}>
                                {applicant.matchScore || 0}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getMatchScoreBg(applicant.matchScore || 0)} transition-all duration-500`}
                                style={{ width: `${applicant.matchScore || 0}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Based on skill overlap with job requirements
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Contact Information
                        </h3>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm">{applicant.email}</span>
                            </div>
                            <button
                                onClick={copyEmail}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                title="Copy email"
                            >
                                {copied ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Skills ({applicant.skills.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {applicant.skills.map((skill: string) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    {applicant.experience && applicant.experience !== 'Not specified' && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Experience
                            </h3>
                            <p className="text-sm text-foreground">{applicant.experience}</p>
                        </div>
                    )}

                    {/* Applied Date */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Application Details
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Applied on {new Date(applicant.appliedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        {applicant.status !== 'accepted' && onAccept && (
                            <Button
                                onClick={() => { onAccept(applicant.id); onClose(); }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Applicant
                            </Button>
                        )}
                        {applicant.status !== 'rejected' && onReject && (
                            <Button
                                variant="outline"
                                onClick={() => { onReject(applicant.id); onClose(); }}
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Applicant
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
