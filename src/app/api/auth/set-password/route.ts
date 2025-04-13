import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

// 设置密码API处理函数
export async function POST(request: NextRequest) {
  try {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('设置密码请求已接收');
    }

    const { email, password } = await request.json();

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('设置密码信息:', { email });
    }

    // 读取数据
    const data = readDataFile();
    
    // 查找用户
    const user = data.users.find((u: any) => u.email === email);
    
    if (!user) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('设置密码失败: 用户不存在', { email });
      }
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 检查用户是否已验证
    if (!user.isVerified) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('设置密码失败: 用户未验证', { email });
      }
      return NextResponse.json(
        { error: '请先验证邮箱' },
        { status: 400 }
      );
    }
    
    // 检查密码是否已设置
    if (user.password) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('设置密码失败: 密码已设置', { email });
      }
      return NextResponse.json(
        { error: '密码已设置，如需修改请使用修改密码功能' },
        { status: 400 }
      );
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 更新用户密码
    user.password = hashedPassword;
    user.updatedAt = new Date().toISOString();
    
    // 保存数据
    writeDataFile(data);

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('密码设置成功:', { userId: user.id, email });
    }

    return NextResponse.json({ 
      success: true, 
      message: '密码设置成功',
      userId: user.id
    });
  } catch (error) {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.error('设置密码失败:', error);
    }
    return NextResponse.json(
      { error: '设置密码失败' },
      { status: 500 }
    );
  }
} 