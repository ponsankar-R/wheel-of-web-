import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { name, regNumber } = await request.json();

    if (!name || !regNumber) {
      return NextResponse.json({ error: 'Name and Registration number are required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ regNumber });
    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already registered', 
        user: { 
          name: existingUser.name, 
          regNumber: existingUser.regNumber,
          assignedQuestion: existingUser.assignedQuestion
        } 
      });
    }

    // Register new user
    await db.collection('users').insertOne({
      name,
      regNumber,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      message: 'Registration successful',
      user: { name, regNumber }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
