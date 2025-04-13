import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * 获取用户数据
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/app/api/data/users.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return NextResponse.json({ error: '获取用户数据失败' }, { status: 500 });
  }
}

/**
 * 保存用户数据
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'src/app/api/data/users.json');
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存用户数据失败:', error);
    return NextResponse.json({ error: '保存用户数据失败' }, { status: 500 });
  }
} 