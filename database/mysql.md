## base

- where：查询条件，比如 where id=1
- as：别名，比如 select xxx as 'yyy'
- and: 连接多个条件
- in/not in：集合查找，比如 where a in (1,2)
- between and：区间查找，比如 where a between 1 and 10
- limit：分页，比如 limit 0,5
- order by：排序，可以指定先根据什么升序、如果相等再根据什么降序，比如 order by a desc,b asc
- group by：分组，比如 group by aaa
- having：分组之后再过滤，比如 group by aaa having xxx > 5
- distinct：去重
- like: 模糊查询，比如 where name like '%a%'
- union：合并两个查询结果，比如 select a from table1 union select b from table2

## 函数

- 聚合函数：avg、count、sum、min、max
- 字符串函数：concat、substr、length、upper、lower
- 数值函数：round、ceil、floor、abs、mod
- 日期函数：year、month、day、date、time
- 条件函数：if、case
- 系统函数：version、datebase、user
- 类型转换函数：convert、cast、date_format、str_to_date
- 其他函数：nullif、coalesce、greatest、least

## 连表

- join on (inner join) 只查询关联
- left join 额外返回左表未关联数据
- right join 额外返回右表未关联数据

## 外键级联方式

- CASCADE（关联删除或更新）
- SET NULL（关联外键设置为 null）
- RESTRICT 或者 NO ACTION（没有从表的关联记录才可以删除或更新）

## 嵌套查询

- EXISTS 存在于, NOT EXISTS 不存在于，可用于增删改查

```sql
-- 嵌套查询
SELECT name, class FROM student WHERE score = (SELECT MAX(score) FROM student);

-- EXISTS
SELECT name FROM department
    WHERE EXISTS (
        SELECT * FROM employee WHERE department.id = employee.department_id
    );
```

## 事务

```bash
START TRANSACTION; #开启事务

SAVEPOINT aaa; #保存回滚点

ROLLBACK TO SAVEPOINT; #回滚至某个点

ROLLBACK; # 回滚所有

COMMIT; # 提交事务
```

事务隔离：性能从高到低

- Read Uncommitted(读取未提交内容)，问题：产生脏读（读取了未提交的数据）
- Read Committed(读取提交内容)，问题：不可重复读（同一行数据被不同事务修改导致读取结果不一致）
- Repeatable Read(可重读) 默认隔离级别。通过一致性视图（snapshot）来解决不可重复度问题，新问题：幻读（因为其他事务插入或删除数据导致结果集中记录的数量变化）
- Serializable(串行化) 在同一时间只允许一个事务修改数据，可靠性高，性能低

## 索引

- 主键索引：唯一，非空
- 唯一索引：唯一
- 普通索引：无限制
- 组合索引：多个字段组合成一个索引，查询时必须包含第一个字段，才能使用索引
- 全文索引：MyISAM支持，InnoDB不支持，用于全文搜索

## 视图

将查询结果封装成视图，方便重用

```sql
-- 创建视图
CREATE VIEW customer_orders AS 
    SELECT 
        c.name AS customer_name, 
        o.id AS order_id, 
        o.order_date, 
        o.total_amount
    FROM customers c
    JOIN orders o ON c.id = o.customer_id;

-- 查询
select * from customer_orders
```

## 存储过程

简化复杂操作，提高性能

```sql
-- 创建存储过程
DELIMITER $$   定义分隔符为$$
CREATE PROCEDURE get_customer_orders(IN customer_id INT)
BEGIN
        SELECT o.id AS order_id, o.order_date, o.total_amount
        FROM orders o
  WHERE o.customer_id = customer_id;
END $$ -- 使用分隔符结束
DELIMITER ;


-- 调用存储过程
CALL get_customer_orders(1);
```

## 函数

使用函数，可以简化查询操作，并获得返回值

```sql
DELIMITER $$
CREATE FUNCTION square(x INT)
RETURNS INT
BEGIN
    DECLARE result INT;
    SET result = x * x;
    RETURN result;
END $$
DELIMITER ;


-- mysql默认不允许创建函数，需要手动设置
SET GLOBAL log_bin_trust_function_creators = 1;
```

## 连接池

连接池中放着好几个 mysql 的连接对象，用的时候取出来执行 sql，用完之后放回去，不需要断开连接。

不使用单独连接，使用连接池的优势是：

- 减少连接开销
- 提高并发性能
- 减少连接数，防止数据库连接过多
