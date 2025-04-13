import { NextRequest, NextResponse } from 'next/server';
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

// 生成验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 找回密码API处理函数
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // 验证输入
    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
        { status: 400 }
      );
    }
    
    // 读取数据
    const data = readDataFile();
    
    // 检查用户是否存在
    const user = data.users.find((user: any) => user.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      );
    }
    
    // 生成验证码
    const verificationCode = generateVerificationCode();
    
    // 添加验证码记录
    data.verificationCodes.push({
      email,
      code: verificationCode,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10分钟有效期
      used: false
    });
    
    // 保存数据
    writeDataFile(data);
    
    // 在实际应用中，这里应该发送验证码邮件
    console.log(`验证码 ${verificationCode} 已发送至 ${email}`);
    
    return NextResponse.json({ 
      success: true, 
      message: '验证码已发送，请查收' 
    });
  } catch (error) {
    console.error('找回密码处理失败:', error);
    return NextResponse.json(
      { error: '找回密码处理失败' },
      { status: 500 }
    );
  }
} 