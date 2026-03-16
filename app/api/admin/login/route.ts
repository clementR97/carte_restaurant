/**
 * POST /api/admin/login — Connexion admin (email + mot de passe).
 * Mot de passe vérifié avec bcrypt. Cookie admin_token = ADMIN_SECRET.
 * Premier admin : si aucun admin en base, création depuis env ADMIN_EMAIL + ADMIN_PASSWORD.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import { AdminModel } from '@/lib/db/models/AdminModel';
import { adminCookieName } from '@/lib/auth/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email as string)?.trim().toLowerCase();
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json(
        { error: 'Configuration admin manquante (ADMIN_SECRET)' },
        { status: 500 }
      );
    }

    await connectDB();

    let admin = await AdminModel.findOne({ email }).lean();

    if (!admin) {
      const count = await AdminModel.countDocuments();
      if (count === 0) {
        const seedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const seedPassword = process.env.ADMIN_PASSWORD;
        if (seedEmail && seedPassword && email === seedEmail && password === seedPassword) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await AdminModel.create({ email, hashedPassword });
          const res = NextResponse.json({ success: true });
          res.cookies.set(adminCookieName(), adminSecret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });
          return res;
        }
      }
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, admin.hashedPassword);
    if (!match) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(adminCookieName(), adminSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 });
  }
}
