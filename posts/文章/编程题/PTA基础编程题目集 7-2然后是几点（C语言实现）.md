---
title: PTA基础编程题目集 7-2然后是几点（C语言实现）
date: 2026-08-07
tags: PTA, C语言, 编程题, 算法
category: 算法题解
summary: 本文是 PTA 编程题“7-2 然后是几点”的题解，涵盖题目描述、输入输出格式及 C 语言实现，展示 4 位整数时分格式的拆解与"加/减分钟数"的统一处理方法。
weight: 102
---

> **摘要**：本文是 PTA 编程题“7-2 然后是几点”的题解，涵盖题目描述、输入输出格式及 C 语言实现，展示 4 位整数时分格式的拆解与"加/减分钟数"的统一处理方法。

## 题目描述
有时候人们用四位数字表示一个时间，比如 `1106` 表示 11 点零 6 分。现在，你的程序要根据起始时间和流逝的时间计算出终止时间。

读入两个数字，第一个数字以这样的四位数字表示当前时间，第二个数字表示分钟数，计算当前时间经过那么多分钟后是几点，结果也表示为四位数字。当小时为个位数时，没有前导的零，例如 5 点 30 分表示为 `530`；0 点 30 分表示为 `030`。注意，第二个数字表示的分钟数可能超过 60，也可能是负数。

### 输入格式：

输入在一行中给出 2 个整数，分别是四位数字表示的起始时间、以及流逝的分钟数，其间以空格分隔。注意：在起始时间中，当小时为个位数时，没有前导的零，即 5 点 30 分表示为 `530`；0 点 30 分表示为 `030`。流逝的分钟数可能超过 60，也可能是负数。

### 输出格式：

输出不多于四位数字表示的终止时间，当小时为个位数时，没有前导的零。题目保证起始时间和终止时间在同一天内。

### 输入样例：

```in
1120 110
```

### 输出样例：

```out
1310
```

## 解题思路

这道题的核心是**把"带时/分含义的 4 位整数"统一换算成"从 0 点开始的总分钟数"**，然后做加减，最后再还原成"小时+分钟"并按要求格式化输出。

### 核心问题分析

1. **位数不固定**：输入 start 可能是 2 位（如 0:30 → 30）、3 位（如 5:30 → 530）、4 位（如 11:06 → 1106）。统一规则：
   - start >= 100：hour = start/100，minute = start%100
   - start < 100：hour = 0，minute = start
2. **流逝时间可正可负**：把所有单位统一成"分钟"后，只需做 total = hour×60 + minute + elapsed，正数加、负数减全部自动处理。
3. **输出格式**：小时正常输出（%d），分钟强制两位补零（%02d），这样可以正确输出 100（1:00）、30（0:30）等形式。

### 算法原理说明

统一为总分钟数 + 反解析 + 格式化：
1. 解析 start → hour, minute
2. total = hour × 60 + minute + elapsed
3. hour_new = total / 60, minute_new = total % 60
4. 按 "%d%02d" 输出

### 具体计算步骤

1. 读入 start, elapsed
2. 按 start 是否 ≥ 100 拆成 hour, minute
3. total = hour*60 + minute + elapsed
4. hour = total/60, minute = total%60
5. printf("%d%02d", hour, minute)

## 代码部分实现
```c
#include <stdio.h>  // 引入标准输入输出头文件

int main() {  // 主函数
    int start, elapsed;  // 定义起始时间和流逝分钟数
    scanf("%d %d", &start, &elapsed);  // 读入起始时间和流逝分钟数
    
    int hour, minute;  // 定义小时和分钟变量
    if (start >= 100) {  // 如果起始时间不少于三位数
        hour = start / 100;  // 提取小时部分
        minute = start % 100;  // 提取分钟部分
    } else {  // 起始时间为两位数（小时为个位数）
        hour = 0;  // 小时为0
        minute = start;  // 整个数就是分钟数
    }
    
    int total_minutes = hour * 60 + minute + elapsed;  // 计算总分钟数
    
    hour = total_minutes / 60;  // 计算终止小时
    minute = total_minutes % 60;  // 计算终止分钟
    
    printf("%d%02d", hour, minute);  // 输出终止时间
    
    return 0;  // 返回0表示程序正常结束
}
```

## 代码流程说明

### 1. 变量声明 & 输入读取
- `int start, elapsed`：起始时间（2~4位整数）、流逝分钟数（可正可负）
- `scanf("%d %d", &start, &elapsed)`

### 2. 拆分时、分
- start ≥ 100 → hour = start/100，minute = start%100
- start < 100 → hour = 0，minute = start

### 3. 统一到"总分钟数"再加/减
- total_minutes = hour×60 + minute + elapsed（elapsed 为负自然是减）

### 4. 还原成时+分
- hour_new = total_minutes / 60
- minute_new = total_minutes % 60

### 5. 格式化输出
- `printf("%d%02d", hour, minute)`：小时不加前导 0（%d）、分钟强制两位补零（%02d）

## 代码流程图

```mermaid
flowchart TD
  A["开始\nmain()"] --> B["读入 start, elapsed"]
  B --> C{"start >= 100 ?"}
  C -- "是" --> D["hour = start/100\nminute = start%100"]
  C -- "否" --> E["hour = 0\nminute = start"]
  D --> F["total = hour*60 + minute + elapsed"]
  E --> F
  F --> G["hour_new = total/60\nminute_new = total%60"]
  G --> H["printf(\"%d%02d\", hour, minute)"]
  H --> I["return 0"]
  I --> J["结束"]
```

## 解题流程图

```mermaid
flowchart TD
  A["开始"] --> B["读入 start（时分）和 elapsed（分钟）"]
  B --> C["拆分 start → hour, minute"]
  C --> D["换算 total = hour*60 + minute + elapsed"]
  D --> E["hour_new = total/60, minute_new = total%60"]
  E --> F["按 \"%d%02d\" 输出"]
  F --> G["结束"]
```
