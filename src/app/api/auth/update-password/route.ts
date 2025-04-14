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
    const { email, oldPassword, newPassword } = await request.json();
    
    // 验证输入
    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: '邮箱、旧密码和新密码不能为空' },
        { status: 400 }
      );
    }
    
    // 读取数据
    const data = readDataFile();
    
    // 查找用户
    const userIndex = data.users.findIndex((user: any) => user.email === email);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      );
    }
    
    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, data.users[userIndex].password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 400 }
      );
    }
    
    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    data.users[userIndex].password = hashedPassword;
    
    // 保存数据
    writeDataFile(data);
    
    return NextResponse.json({ 
      success: true, 
      message: '密码修改成功' 
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    );
  }
} 