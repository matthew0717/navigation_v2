import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

// 获取数据文件路径
const dataFilePath = path.join(process.cwd(), 'src/app/api/data/users.json');

// 读取数据文件
const readDataFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return { users: [], verificationCodes: [] };
  }
};

// 写入数据文件
const writeDataFile = (data: any) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入数据文件失败:', error);
    return false;
  }
};

// 登录API处理函数
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 读取数据
    const data = readDataFile();
    
    // 查找用户
    const user = data.users.find((user: any) => user.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      );
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 400 }
      );
    }
    
    // 更新最后登录时间
    user.lastLogin = new Date().toISOString();
    writeDataFile(data);
    
    // 生成JWT令牌
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // 返回用户信息和令牌
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
} 