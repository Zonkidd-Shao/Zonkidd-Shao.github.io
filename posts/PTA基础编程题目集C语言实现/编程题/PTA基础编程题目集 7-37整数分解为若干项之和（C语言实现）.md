---
title: PTA基础编程题目集 7-37整数分解为若干项之和（C语言实现）
date: 2026-08-07
tags: PTA基础编程题目集, C语言, 数据结构
category: PTA基础编程题目集/编程题/C语言实现
summary: 本文是 PTA 编程题"7-37 整数分解为若干项之和"的题解，涵盖题目描述、输入输出格式及 C 语言实现，展示使用深度优先搜索（DFS）生成所有"每项不小于前一项"的整数 N 分解序列（递增顺序保证字典序），并通过两次 DFS：第一次先计数所有合法方案总数 total，第二次按格式输出，实现"每 4 个式子换行、式子间用 ; 分隔、每 4 个或最后一个不加 ; 而换行"的严格格式控制。
weight: 137
---

> **摘要**：本文是 PTA 编程题"7-37 整数分解为若干项之和"的题解，涵盖题目描述、输入输出格式及 C 语言实现，展示使用深度优先搜索（DFS）生成所有"每项不小于前一项"的整数 N 分解序列（递增顺序保证字典序），并通过两次 DFS：第一次先计数所有合法方案总数 total，第二次按格式输出，实现"每 4 个式子换行、式子间用 ; 分隔、每 4 个或最后一个不加 ; 而换行"的严格格式控制。

## 题目描述
将一个正整数 N 分解成几个正整数相加，可以有多种分解方法，例如 7=6+1，7=5+2，7=5+1+1，…。编程求出正整数 N 的所有整数分解式子。

### 输入格式：

每个输入包含一个测试用例，即正整数 N (0<N≤30)。

### 输出格式：

按递增顺序输出 N 的所有整数分解式子。递增顺序是指：对于两个分解序列 N₁={n₁,n₂,⋯} 和 N₂={m₁,m₂,⋯}，若存在 i 使得 n₁=m₁,⋯,nᵢ=mᵢ，但是 nᵢ₊₁<mᵢ₊₁，则 N₁序列必定在 N₂序列之前输出。每个式子由小到大相加，式子间用分号隔开，且每输出 4 个式子后换行。

### 输入样例：

```
7
```

### 输出样例：

```
7=1+1+1+1+1+1+1;7=1+1+1+1+1+2;7=1+1+1+1+3;7=1+1+1+2+2
7=1+1+1+4;7=1+1+2+3;7=1+1+5;7=1+2+2+2
7=1+2+4;7=1+3+3;7=1+6;7=2+2+3
7=2+5;7=3+4;7=7
```

## 解题思路

这道题的核心是**用 DFS 生成"单调不减"的所有分解（保证按字典序） + 预计算所有方案总数 total 以便按 4 个换行格式正确输出**。

1. **DFS 分解框架**：递归过程中维护三个参数：
   - `start`：当前层可选的最小数值（保证后续项 ≥ 前一项，从而整个序列非降，这样每个分解唯一且按字典序输出）
   - `remaining`：剩余还需要凑出来的和值（初值 N，最后必须减到 0 才能算合法方案）
   - `depth`：当前已经选了几个数（对应 `result[depth]` 写入当前分解值）
   - 每一层循环 `i` 从 `start` 到 `remaining`（不能超过剩余值，否则下一层直接负数），把 `i` 放入当前层，然后递归 `dfs(i, remaining - i, depth + 1)`。
   - 递归出口：`remaining == 0` → 得到一个合法分解。
2. **保证"由小到大相加顺序+字典序"**：每一层的选择范围 `i >= start`，使得当前项 ≥ 上一项，因此整个分解序列非降，且自然按题目要求的"递增"字典序生成（先选小的前面部分）。
3. **严格的格式控制**（难点）：
   - 每个方案写成 `N=项1+项2+…+项k`
   - 方案之间用 `;` 分隔
   - 每输出 4 个方案后换行（而不是每个分号后换行）
   - 恰好是 4 的倍数 或 是最后一个方案 total 时 → 换行，否则打 `;`
   - 这就必须在输出前先知道"总共有多少个方案 total"，否则无法判断某方案"是不是最后一个"，因此要**做两遍 DFS**：
     - 第一遍 `dfs_count`：只统计合法方案数，写入全局 `total`
     - 第二遍 `dfs_print`：每当 `remaining==0` 时就打印这一个方案，并通过全局 `count` 判断：`count%4==0 || count==total` 时换行，否则 `;`
4. **样例 N=7 对照**：DFS 按 start=1 开始层层选，依次生成长度 7、6、5、4、3、2、1 的非降分解共 15 种，每 4 个换行正好 4 行，与样例完全一致。

### 核心问题分析

1. **为什么要 start 参数**：
   - 如果每层都从 1 开始选，就会同时生成 `[1,6]` 与 `[6,1]`，两者都是 7 的分解，但题目把 `[1,6]` 视为一种而非两种，且必须小的在前。
   - start 限制当前选择 ≥ 前一个值，保证序列单调不减，这样每种"多重集"只生成一次，且字典序正确。
2. **为什么两遍 DFS**：
   - 题目格式是"每 4 个分号后换行、最后一个方案之后必须换行而不能带 ; 或其他多余字符"
   - 若不先统计 total，就无法在输出第 count 个时判断 `count == total`（最后一个），容易：
     - 多打一个 `;` 在最后（比如 15 个方案中第 15 个后面应该是换行，而不是 `;` 再换行）
   - 第一遍 DFS 只做加 total、不做任何打印，时间空间几乎可忽略（N 最大 30，方案数数千级完全可接受）
3. **输出分解式子**：`print_result(depth)`：
   - 先打 `N=`，再打 `result[0]`
   - 再对 i=1..depth-1，依次打 `+result[i]`
   - 然后全局 `count++`，判断：
     - 若 `count % 4 == 0 || count == total` → `printf("\n")`
     - 否则 → `printf(";")`

### 算法原理说明

两个 DFS：
1. **dfs_count(start, remaining)**：
   - `if (remaining == 0) { total++; return; }`
   - `for (int i = start; i <= remaining; i++) dfs_count(i, remaining - i);`
2. **dfs_print(start, remaining, depth)**：
   - `if (remaining == 0) { print_result(depth); return; }`
   - `for (int i = start; i <= remaining; i++) { result[depth] = i; dfs_print(i, remaining-i, depth+1); }`
3. **主函数**：
   - 读 N
   - `dfs_count(1, N);` 得到总方案数 total
   - 全局 count 归零 → `dfs_print(1, N, 0);`
   - return 0

### 具体计算步骤（N=7）
1. dfs_count 得 total = 15
2. dfs_print 从 start=1 依次选：
   - 1+1+1+1+1+1+1 → count=1 → ;
   - 1+1+1+1+1+2 → count=2 → ;
   - 1+1+1+1+3 → count=3 → ;
   - 1+1+1+2+2 → count=4 → 换行
   - …按 4 个一组继续；直到最后一个 7=7，count=15=total → 换行

## 代码部分实现
```c
#include <stdio.h>       // 标准输入输出：scanf、printf

int N;                  // 全局：待分解的正整数 N（题目 0<N≤30）
int result[35];         // 全局：存储当前 DFS 路径的分解项数组（N=30 时项数≤30，35够）
int count = 0;          // 全局：dfs_print 过程中已经输出的方案计数
int total = 0;          // 全局：dfs_count 统计得到的所有合法分解方案总数

// 第一遍 DFS：只统计有多少种合法分解方案（写入 total），不做输出
// start：当前层可以选择的最小值（保证 ≥ 上一项，单调不减）
// remaining：还需要凑的剩余数值
void dfs_count(int start, int remaining) {
    if (remaining == 0) {        // 剩余为 0 → 找到一个合法分解
        total++;                 // 方案总数 +1
        return;
    }
    for (int i = start; i <= remaining; i++) {   // i 从 start 到 remaining（不超剩余值）
        dfs_count(i, remaining - i);             // 下一层：可选最小 i（仍≥本项）、剩余减 i
    }
}

// 输出一个分解方案：N=result[0]+result[1]+...+result[depth-1]
// 并按"每 4 个一行、之间用 ; 分隔、最后一个或第4的倍数换行"打印分隔符
void print_result(int depth) {
    printf("%d=%d", N, result[0]);  // 开头：N=第一项
    for (int i = 1; i < depth; i++) { // 从第 2 项开始依次 +项
        printf("+%d", result[i]);
    }
    count++;                         // 已输出方案计数 +1
    // 分隔符：每 4 个一行，或最后一个 → 换行；否则 ;
    if (count % 4 == 0 || count == total) {
        printf("\n");
    } else {
        printf(";");
    }
}

// 第二遍 DFS：按 DFS 顺序生成所有合法分解，一旦剩余为 0 就调用 print_result 输出
// depth：当前已经选了 depth 个数（即下一个写入 result[depth]）
void dfs_print(int start, int remaining, int depth) {
    if (remaining == 0) {        // 凑成完整分解
        print_result(depth);     // 输出这一条
        return;
    }
    for (int i = start; i <= remaining; i++) {   // 逐一枚举当前层选择 i（单调不减）
        result[depth] = i;                       // 记录该项到结果数组
        dfs_print(i, remaining - i, depth + 1);  // 递归下一层（下一项 ≥ i、剩余减 i、深度+1）
    }
}

int main() {
    scanf("%d", &N);      // 读入要分解的正整数 N
    dfs_count(1, N);      // 第一遍 DFS：统计合法分解方案总数 total
    count = 0;            // 重置输出计数器（第二遍用）
    dfs_print(1, N, 0);   // 第二遍 DFS：生成并按格式输出所有方案
    return 0;             // 程序正常结束
}
```

## 代码流程说明

### 1. 全局变量
- `int N`：待分解整数
- `int result[35]`：存放当前分解路径
- `int count`：已输出方案计数
- `int total`：合法方案总数（第一遍得到）

### 2. 第一遍 dfs_count(start, remaining)
- `remaining==0` → `total++; return;`
- `for i=start..remaining` → `dfs_count(i, remaining-i)`

### 3. print_result(depth)
- `printf("%d=%d", N, result[0])`
- 对 i=1..depth-1 → `printf("+%d", result[i])`
- `count++`
- `count%4==0 || count==total` → 换行；否则 `;`

### 4. 第二遍 dfs_print(start, remaining, depth)
- `remaining==0` → `print_result(depth); return;`
- `for i=start..remaining`：
  - `result[depth]=i`
  - `dfs_print(i, remaining-i, depth+1)`

### 5. main
- `scanf("%d", &N)`
- `dfs_count(1,N)` 求 total
- `count=0`
- `dfs_print(1,N,0)` 输出
- `return 0`

## 代码流程图

```mermaid
flowchart TD
  A["开始\nmain()"] --> B["scanf N"]
  B --> C["dfs_count(1,N)\n统计 total 总数"]
  C --> D["count=0"]
  D --> E["dfs_print(1,N,0)\n生成并输出"]
  E --> F["DFS 每到 remaining==0 就 print_result"]
  F --> G["输出：N=项+项+...\ncount++；4倍或最后→换行；否则;"]
  G --> H["所有方案生成完后 return 0"]
  H --> I["结束"]
```

## 解题流程图

```mermaid
flowchart TD
  A["开始"] --> B["输入正整数 N（≤30）"]
  B --> C["第一遍 DFS：从 1 开始枚举单调不减分解，统计所有合法方案总数 total"]
  C --> D["初始化已输出方案计数 count=0"]
  D --> E["第二遍 DFS：再次枚举所有单调不减分解"]
  E --> F{"剩余和 remaining == 0?"}
  F -- "否" --> G["对 i=start..remaining，选 i 写入结果，递归下一层"]
  F -- "是" --> H["打印 N=项+项+... 格式的方案，并 count++"]
  H --> I{"count 是 4 的倍数 或 最后一个方案(total)?"}
  I -- "是" --> J["换行"]
  I -- "否" --> K["打 ; 分隔"]
  J --> L["继续 DFS"]
  K --> L
  L --> M{"所有方案都输完?"}
  M -- "否" --> E
  G --> M
  M -- "是" --> N["结束"]
```
