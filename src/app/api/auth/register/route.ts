import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 用户数据文件路径
const usersFilePath = path.join(process.cwd(), 'src/app/api/data/users.json');

// 确保用户数据文件存在
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify({ users: [] }));
}

/**
 * 处理用户注册请求
 * @param request 请求对象
 * @returns 响应对象
 */
export async function POST(request: Request) {
  try {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('注册请求已接收');
    }

    const { email, name } = await request.json();

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('注册信息:', { email, name });
    }

    // 读取现有用户数据
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

    // 检查邮箱是否已注册
    if (usersData.users.some((user: any) => user.email === email)) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('注册失败: 邮箱已存在', email);
      }
      return NextResponse.json(
        { error: '邮箱已注册' },
        { status: 400 }
      );
    }

    // 生成验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date();
    codeExpiry.setMinutes(codeExpiry.getMinutes() + 10); // 10分钟有效期

    // 创建新用户
    const newUser = {
      id: uuidv4(),
      email,
      name,
      verificationCode,
      codeExpiry: codeExpiry.toISOString(),
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 添加新用户到数据文件
    usersData.users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('用户注册成功:', { userId: newUser.id, email });
      console.log('验证码:', verificationCode);
    }

    // 在实际应用中，这里应该发送验证码邮件
    // 为了演示，我们直接返回验证码
    return NextResponse.json({
      message: '注册成功，请查收验证码',
      verificationCode // 仅用于演示，实际应用中不应返回
    });
  } catch (error) {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.error('注册过程中发生错误:', error);
    }
    
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
} 