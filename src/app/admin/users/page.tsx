import { prisma } from "@/lib/db";
import { UserActions } from "./user-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function UsersPage() {
    const session = await auth();
    const [users, packages] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: { notificationSettings: true } // explicit include sometimes forces type refresh or it's just stale.
        }),
        prisma.package.findMany({
            where: { isActive: true },
            select: { name: true, displayName: true, smsCredits: true }
        })
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Kayıtlı Kullanıcılar ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">İsim / Email</th>
                                    <th className="px-6 py-3">Paket</th>
                                    <th className="px-6 py-3">Rol</th>
                                    <th className="px-6 py-3">SMS Kredisi</th>
                                    <th className="px-6 py-3">Kayıt Tarihi</th>
                                    <th className="px-6 py-3">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <a href={`/admin/users/${user.id}`} className="group">
                                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {user.name || '-'}
                                                </div>
                                                <div className="text-gray-500 group-hover:text-blue-500 transition-colors">{user.email}</div>
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.subscriptionTier === 'PRO' ? 'bg-purple-100 text-purple-800' :
                                                user.subscriptionTier === 'BASIC' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.subscriptionTier || 'FREE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const pkg = packages.find(p => p.name === user.subscriptionTier);
                                                const total = pkg?.smsCredits || (user.subscriptionTier === 'PRO' ? 50 : user.subscriptionTier === 'BASIC' ? 10 : 5);
                                                const remaining = user.smsCredits || 0;
                                                const percentage = Math.min((remaining / total) * 100, 100);

                                                return (
                                                    <div className="flex flex-col gap-1 w-[120px]">
                                                        <div className="flex justify-between text-xs font-mono">
                                                            <span className={remaining === 0 ? "text-red-500 font-bold" : ""}>{remaining}</span>
                                                            <span className="text-muted-foreground">/ {total}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${percentage < 20 ? 'bg-red-500' :
                                                                    percentage < 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                                    }`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <UserActions
                                                userId={user.id}
                                                currentRole={user.role}
                                                currentPackage={user.subscriptionTier || 'FREE'}
                                                packages={packages}
                                                isCurrentUser={session?.user?.id === user.id}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
