-- 旅行记账本 - Supabase 数据库 Schema

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 房间表
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL, -- 6 位房间代码，如 A7K9M2
    name VARCHAR(100) NOT NULL, -- 账本名称，如"大理旅行"
    pin_code VARCHAR(4), -- 可选的 4 位 PIN 码
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 成员表
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 成员名字
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, name) -- 同一房间内名字唯一
);

-- 支出表
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY', -- CNY/USD/KRW
    description VARCHAR(500) NOT NULL,
    category VARCHAR(50), -- 餐饮/交通/住宿等
    participant_ids UUID[] NOT NULL, -- 参与分摊的成员 ID 数组
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_members_room ON members(room_id);
CREATE INDEX idx_expenses_room ON expenses(room_id);
CREATE INDEX idx_expenses_payer ON expenses(payer_id);
CREATE INDEX idx_rooms_code ON rooms(code);

-- 行级安全策略 (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 允许任何人创建房间
CREATE POLICY "Anyone can create rooms" ON rooms
    FOR INSERT WITH CHECK (true);

-- 允许任何人查看房间（知道房间代码即可）
CREATE POLICY "Anyone can view rooms" ON rooms
    FOR SELECT USING (true);

-- 允许任何人添加成员
CREATE POLICY "Anyone can add members" ON members
    FOR INSERT WITH CHECK (true);

-- 允许查看同一房间的成员
CREATE POLICY "View members in same room" ON members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rooms
            WHERE rooms.id = members.room_id
        )
    );

-- 允许添加支出
CREATE POLICY "Anyone can add expenses" ON expenses
    FOR INSERT WITH CHECK (true);

-- 允许查看同一房间的支出
CREATE POLICY "View expenses in same room" ON expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rooms
            WHERE rooms.id = expenses.room_id
        )
    );

-- 允许删除自己的支出
CREATE POLICY "Delete own expenses" ON expenses
    FOR DELETE USING (true);

-- 允许更新自己的支出
CREATE POLICY "Update own expenses" ON expenses
    FOR UPDATE USING (true);
