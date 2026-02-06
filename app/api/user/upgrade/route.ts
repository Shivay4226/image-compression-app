import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { isPro } = await req.json();

        await dbConnect();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { isPro: !!isPro },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: `User plan updated to ${user.isPro ? 'Pro' : 'Free'}`,
            isPro: user.isPro,
        });
    } catch (error: any) {
        console.error('Upgrade error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
