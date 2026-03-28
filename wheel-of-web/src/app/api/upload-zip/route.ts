import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Binary } from 'mongodb';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const regNumber = formData.get('regNumber') as string;
    const file = formData.get('file') as File;

    if (!regNumber || !file) {
      return NextResponse.json({ error: 'Registration number and file are required' }, { status: 400 });
    }

    // Check size again on server (extra safety)
    const MAX_SIZE = 16 * 1024 * 1024; // 16MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 16MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const db = await getDb();
    
    // Update user record with zip file
    const result = await db.collection('users').updateOne(
      { regNumber },
      { 
        $set: { 
          zipFile: new Binary(buffer),
          fileName: file.name,
          uploadedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      fileName: file.name
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
