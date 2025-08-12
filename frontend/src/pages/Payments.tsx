import React from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../store/auth';
import { listMyPayments, PaymentRecord } from '../api/client';
import { Card } from '../components/Card';

export default function Payments() {
    const { token } = useRecoilValue(authAtom);
    const [rows, setRows] = React.useState<PaymentRecord[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            if (!token) return;
            try {
                const data = await listMyPayments(token);
                setRows(data);
            } catch (e: any) {
                setError(e?.message || 'Failed to load payments');
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    return (
        <div className="app-container py-6">
            <h1 className="mb-4 text-xl font-semibold">Payments</h1>
            <Card className="p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/20">
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Signature</th>
                            <th className="px-3 py-2 text-left">From</th>
                            <th className="px-3 py-2 text-left">To</th>
                            <th className="px-3 py-2 text-right">Amount (lamports)</th>
                            <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td className="px-3 py-4" colSpan={6}>Loading...</td></tr>
                        )}
                        {error && !loading && (
                            <tr><td className="px-3 py-4 text-red-500" colSpan={6}>{error}</td></tr>
                        )}
                        {!loading && !error && rows.length === 0 && (
                            <tr><td className="px-3 py-4 text-muted" colSpan={6}>No payments yet.</td></tr>
                        )}
                        {!loading && !error && rows.map(p => (
                            <tr key={p.id} className="border-t border-border/50">
                                <td className="px-3 py-2">{new Date(p.createdAt).toLocaleString()}</td>
                                <td className="px-3 py-2"><a className="text-primary hover:underline" href={`https://solscan.io/tx/${p.signature}?cluster=devnet`} target="_blank" rel="noreferrer">{p.signature.slice(0, 10)}…</a></td>
                                <td className="px-3 py-2">{p.fromAddress.slice(0, 6)}…{p.fromAddress.slice(-4)}</td>
                                <td className="px-3 py-2">{p.toAddress.slice(0, 6)}…{p.toAddress.slice(-4)}</td>
                                <td className="px-3 py-2 text-right">{p.amountLamports.toLocaleString()}</td>
                                <td className="px-3 py-2">{p.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
