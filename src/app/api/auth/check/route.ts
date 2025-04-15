import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// 获取数据文件路径
const dataFilePath = path.join(process.cwd(), 'src/app/api/data/users.json');

// 读取数据文件
const readDataFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return { users: [] };
  }
};

/**
 * 检查登录状态 API 路由
 * 验证 JWT 令牌并返回用户信息
 */
export async function GET(request: NextRequest) {
  try {
    // 获取 token
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    // 验证 token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // 读取用户数据
    const data = readDataFile();
    
    // 查找用户
    const user = data.users.find((u: any) => u.id === decoded.id);
    
    if (!user) {
      return NextResponse.json({ user: null });
    }
    
    // 返回用户信息
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return NextResponse.json({ user: null });
  }
} 