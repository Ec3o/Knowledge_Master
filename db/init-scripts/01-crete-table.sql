CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- 创建用户表（与你之前的代码匹配）
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 知识库表
CREATE TABLE knowledge_bases (
    kb_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cover_image_url TEXT,
    collaboration_mode VARCHAR(20) DEFAULT 'PRIVATE' -- PRIVATE/TEAM/PUBLIC
);

-- 知识库成员表
CREATE TABLE kb_members (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kb_id UUID REFERENCES knowledge_bases(kb_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- OWNER/EDITOR/VIEWER 可管理/可编辑/只读
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 知识节点表
CREATE TABLE knowledge_nodes (
    node_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kb_id UUID REFERENCES knowledge_bases(kb_id) ON DELETE CASCADE,
    parent_id UUID REFERENCES knowledge_nodes(node_id) ON DELETE CASCADE,
    node_type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户资料表
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    username VARCHAR(100), 
    description TEXT,
    website VARCHAR(255),
    avatar_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX idx_nodes_kb ON knowledge_nodes(kb_id);
CREATE INDEX idx_nodes_parent ON knowledge_nodes(parent_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);