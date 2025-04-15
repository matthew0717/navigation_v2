import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('写入数据文件失败:', error);
  }
};

/**
 * 绑定邮箱 API 路由
 * 处理用户绑定邮箱请求
 */
export async function POST(request: NextRequest) {
  try {
    // 获取请求数据
    const { email, code } = await request.json();
    
    // 验证输入
    if (!email || !code) {
      return NextResponse.json(
        { error: '邮箱和验证码不能为空' },
        { status: 400 }
      );
    }
    
    // 读取数据
    const data = readDataFile();
    
    // 查找验证码记录
    const verificationCode = data.verificationCodes.find(
      (vc: any) => vc.email === email && vc.code === code && !vc.used
    );
    
    if (!verificationCode) {
      return NextResponse.json(
        { error: '验证码无效或已使用' },
        { status: 400 }
      );
    }
    
    // 检查验证码是否过期
    const now = new Date();
    const expiryDate = new Date(verificationCode.expiresAt);
    
    if (now > expiryDate) {
      return NextResponse.json(
        { error: '验证码已过期' },
        { status: 400 }
      );
    }
    
    // 查找用户
    const user = data.users.find((u: any) => u.id === verificationCode.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      );
    }
    
    // 更新用户邮箱
    user.email = email;
    user.isVerified = true;
    user.updatedAt = new Date().toISOString();
    
    // 标记验证码为已使用
    verificationCode.used = true;
    
    // 保存数据
    writeDataFile(data);
    
    // 生成 JWT 令牌
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: '邮箱绑定成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('绑定邮箱失败:', error);
    return NextResponse.json(
      { error: '绑定邮箱失败' },
      { status: 500 }
    );
  }
} 