# 数据库设计

## 数据表结构

### watch_tasks（抢票任务表）
```sql
create table watch_tasks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    from_station varchar not null,
    to_station varchar not null,
    travel_date date not null,
    preferred_trains text[], -- 优先车次
    seat_types text[], -- 座位类型优先级
    passenger_ids text[], -- 乘客证件号
    status varchar not null default 'active',
    rpa_webhook_url varchar, -- RPA服务的Webhook URL
    rpa_callback_url varchar, -- RPA回调URL
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
```

### rpa_tasks（RPA执行记录表）
```sql
create table rpa_tasks (
    id uuid default uuid_generate_v4() primary key,
    watch_task_id uuid references watch_tasks not null,
    status varchar not null default 'pending',
    rpa_machine_id varchar,
    enterprise_id uuid,
    flow_id varchar,
    flow_process_no varchar,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    result jsonb,
    error_message text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
```

## 状态定义
- watch_tasks.status:
  - active: 活跃
  - completed: 完成
  - failed: 失败
  - stopped: 已停止

- rpa_tasks.status:
  - pending: 等待中
  - running: 执行中
  - completed: 完成
  - failed: 失败