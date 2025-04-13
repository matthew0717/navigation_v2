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

// 更新密码API处理函数
export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();
    
    // 验证输入
    if (!email || !code || !password) {
      return NextResponse.json(
        { error: '邮箱、验证码和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 读取数据
    const data = readDataFile();
    
    // 查找验证码记录
    const verificationRecord = data.verificationCodes.find(
      (record: any) => record.email === email && record.code === code && !record.used
    );
    
    if (!verificationRecord) {
      return NextResponse.json(
        { error: '验证码无效或已过期' },
        { status: 400 }
      );
    }
    
    // 检查验证码是否过期
    const now = new Date();
    const expiresAt = new Date(verificationRecord.expiresAt);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: '验证码已过期' },
        { status: 400 }
      );
    }
    
    // 查找用户
    const userIndex = data.users.findIndex((user: any) => user.email === email);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      );
    }
    
    // 更新密码
    const hashedPassword = await bcrypt.hash(password, 10);
    data.users[userIndex].password = hashedPassword;
    
    // 标记验证码为已使用
    verificationRecord.used = true;
    
    // 保存数据
    writeDataFile(data);
    
    return NextResponse.json({ 
      success: true, 
      message: '密码更新成功，请登录' 
    });
  } catch (error) {
    console.error('更新密码失败:', error);
    return NextResponse.json(
      { error: '更新密码失败' },
      { status: 500 }
    );
  }
} 