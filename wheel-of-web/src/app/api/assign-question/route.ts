import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { regNumber, questionId } = await request.json();

    if (!regNumber || !questionId) {
      return NextResponse.json({ error: 'Registration number and Question ID are required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if user has already been assigned a question
    const user = await db.collection('users').findOne({ regNumber });
    if (user?.assignedQuestion) {
      return NextResponse.json({ 
        message: 'Question already assigned', 
        assignedQuestion: user.assignedQuestion 
      });
    }

    // Assign question
    await db.collection('users').updateOne(
      { regNumber },
      { $set: { assignedQuestion: questionId } }
    );

    return NextResponse.json({ 
      message: 'Question assigned successfully',
      assignedQuestion: questionId
    });
  } catch (error) {
    console.error('Assign question error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
