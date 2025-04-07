-- Create the projects table
create table projects (
    id bigint primary key generated always as identity,
    name text,
    location text,
    type text,
    pics text,
    number_of_units int,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    number_of_sold_items INTEGER DEFAULT 0
);

-- Create the units table
create table units (
    id bigint primary key generated always as identity,
    project_id bigint references projects (id),
    name text,
    area numeric,
    price numeric,
    unit_notes text,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    status TEXT DEFAULT 'available',
    sold_date TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX idx_units_project_id ON units (project_id);

-- Create the employees table
create table employees (
    id bigint primary key generated always as identity,
    name text,
    number text,
    role text,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    notes text,
    hashedPass text

);
CREATE INDEX idx_employees_role ON employees (role);

-- Create the fcm_tokens table
create table fcm_tokens (
    id bigint primary key generated always as identity,
    sales_id bigint references employees (id) ON DELETE CASCADE, -- If an employee is deleted, their tokens are also removed
    fcm_token text,
    created_at timestamp default now(),
    updated_at timestamp default now()
);
CREATE INDEX idx_fcm_tokens_sales_id ON fcm_tokens (sales_id);
CREATE INDEX idx_fcm_tokens_token ON fcm_tokens (fcm_token);

-- Create the leads table
create table leads (
    id bigint primary key generated always as identity,
    name text,
    number text,
    source text,
    address text,
    state text,
    substate text,
    sales_id bigint references employees (id),
    budget numeric,
    notes text,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    is_created_by_sales boolean default false,
    notification_id text
);
CREATE INDEX idx_leads_sales_id ON leads (sales_id);
CREATE INDEX idx_leads_source ON leads (source);

-- Create the actions table
create table actions (
    id bigint primary key generated always as identity,
    customer_id bigint references leads (id),
    sales_id bigint references employees (id),
    created_at timestamp default now(),
    updated_at timestamp default now(),
    project_id bigint references projects (id),
    unit_id bigint references units (id),
    prev_state text,
    prev_substate text,
    new_state text,
    new_substate text,
    notes text
);
CREATE INDEX idx_actions_customer_id ON actions (customer_id);
CREATE INDEX idx_actions_sales_id ON actions (sales_id);
CREATE INDEX idx_actions_project_id ON actions (project_id);
CREATE INDEX idx_actions_unit_id ON actions (unit_id);

-- Create the tasks table
create table tasks (
    id bigint primary key generated always as identity,
    name text,
    customer_id bigint references leads (id),
    sales_id bigint references employees (id),
    created_at timestamp default now(),
    updated_at timestamp default now(),
    action_id bigint references actions (id),
    due_date timestamp
);
CREATE INDEX idx_tasks_customer_id ON tasks (customer_id);
CREATE INDEX idx_tasks_sales_id ON tasks (sales_id);
CREATE INDEX idx_tasks_action_id ON tasks (action_id);