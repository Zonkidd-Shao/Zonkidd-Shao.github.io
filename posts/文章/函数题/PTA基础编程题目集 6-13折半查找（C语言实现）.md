---
title: PTA基础编程题目集 6-13折半查找（C语言实现）
date: 2026-08-07
tags: PTA, C语言, 函数题, 算法
category: PTA基础编程题目集/函数题/C语言实现
summary: 本文是 PTA 函数题“6-13 折半查找（二分查找）”的题解，涵盖题目描述、函数接口定义及 C 语言实现，展示有序顺序表上经典的二分查找算法与复杂度分析。
weight: 213
---

> **摘要**：本文是 PTA 函数题“6-13 折半查找（二分查找）”的题解，涵盖题目描述、函数接口定义及 C 语言实现，展示有序顺序表上经典的二分查找算法与复杂度分析。

## 题目描述

给一个严格递增数列，函数int Search_Bin(SSTable T, KeyType k)用来二分地查找k在数列中的位置。

### 函数接口定义：

```c++
int  Search_Bin(SSTable T, KeyType k)
```

其中T是有序表，k是查找的值。

### 裁判测试程序样例：

```c++
#include <iostream>
using namespace std;

#define MAXSIZE 50
typedef int KeyType;

typedef  struct                     
{ KeyType  key;                                             
} ElemType;  

typedef  struct
{ ElemType  *R; 
  int  length;
} SSTable;                      

void  Create(SSTable &T)
{ int i;
  T.R=new ElemType[MAXSIZE+1];
  cin>>T.length;
  for(i=1;i<=T.length;i++)
     cin>>T.R[i].key;   
}

int  Search_Bin(SSTable T, KeyType k);

int main () 
{  SSTable T;  KeyType k;
   Create(T);
   cin>>k;
   int pos=Search_Bin(T,k);
   if(pos==0) cout<<"NOT FOUND"<<endl;
   else cout<<pos<<endl;
   return 0;
}

/* 请在这里填写答案 */
```

\###输入格式：

第一行输入一个整数n，表示有序表的元素个数，接下来一行n个数字，依次为表内元素值。 然后输入一个要查找的值。

\###输出格式：

输出这个值在表内的位置，如果没有找到，输出"NOT FOUND"。

### 输入样例：

```in
5
1 3 5 7 9
7
```

### 输出样例：

```out
4
```

### 输入样例：

```
5
1 3 5 7 9
10
```

### 输出样例：

```
NOT FOUND
```

## 解题思路

这道题的核心是**有序顺序表上的二分查找（折半查找）**。前提是表已按关键字升序排列（严格递增），每次取中点比较，可把搜索区间减半。

### 核心问题分析

1. **下标约定**：题目样例中存储从下标 1 开始（Create 函数 for i=1..length，输入 1 3 5 7 9 查找 7 得到位置 4，即 1 起下标），因此 low 应初始为 1，high 为 T.length。
2. **中点计算**：mid = (low + high) / 2（向下取整，整数除法）。也可以写成 low + (high-low)/2 防止溢出，此处题目数据量小，前者足够。
3. **三种分支**：
   - R[mid].key == k → 命中，return mid
   - R[mid].key >  k → 目标在左半区，high = mid - 1
   - R[mid].key <  k → 目标在右半区，low = mid + 1
4. **终止条件**：当 low > high 说明区间为空，未找到，return 0（主程序按 0 判 NOT FOUND）。

### 算法原理说明

循环迭代式二分查找：
- 初始化 low = 1, high = T.length
- while (low <= high)：
  - mid = (low + high) / 2
  - 根据 T.R[mid].key 与 k 的大小关系走上面三个分支
- 循环结束 return 0

### 具体计算步骤

1. low = 1, high = T.length
2. while low <= high：
   - mid = (low + high) / 2
   - if T.R[mid].key == k → return mid
   - else if T.R[mid].key > k → high = mid - 1
   - else → low = mid + 1
3. return 0

## 函数部分实现

```c
/* 6-13 折半查找
 * 函数：Search_Bin
 * 功能：在有序顺序表 T（1 起下标，升序）中二分查找关键字 k
 * 参数：
 *   T — 有序顺序表（R[1..length] 按 key 升序）
 *   k — 待查关键字
 * 返回值：命中返回 1..length 的下标；未找到返回 0
 * 实现原理：经典循环式二分查找。
 *   - low=1, high=T.length；每次取 mid=(low+high)/2
 *   - 命中返回 mid，目标偏小则 high=mid-1，偏大则 low=mid+1
 *   - low>high 未命中返回 0
 * 时间复杂度 O(log n)，空间复杂度 O(1)
 */
int Search_Bin(SSTable T, KeyType k)
{
    int low = 1, high = T.length;
    while(low <= high)
    {
        int mid = (low + high) / 2;     /* 取中点 */
        if(T.R[mid].key == k)
            return mid;                 /* 找到 */
        else if(T.R[mid].key > k)
            high = mid - 1;             /* 目标在左半区 */
        else
            low = mid + 1;              /* 目标在右半区 */
    }
    return 0;                           /* 未找到 */
}
```

## 完整代码实现

```c
/* 6-13 折半查找（二分查找）
 * 题目：在有序顺序表 SSTable 中查找关键字 k，
 *       找到则返回其位置（1 起下标），否则返回 0。
 * 实现原理：二分查找（前提：表已按关键字升序排列）。
 *           设 low=1、high=length，循环取中点 mid=(low+high)/2：
 *             - 若 R[mid]==k，找到，返回 mid；
 *             - 若 R[mid]>k，目标在左半区，令 high=mid-1；
 *             - 若 R[mid]<k，目标在右半区，令 low=mid+1；
 *           当 low>high 仍未找到，返回 0。
 * 时间复杂度 O(log n)，空间复杂度 O(1)。
 * 注意：完整 C 语言实现中把 C++ 的 new/cin 替换为对应的 malloc/scanf。
 */
#include <stdio.h>
#include <stdlib.h>

#define MAXSIZE 50
typedef int KeyType;

typedef struct
{
    KeyType key;
} ElemType;

typedef struct
{
    ElemType *R;
    int length;
} SSTable;

/* 读入顺序表（1 起下标存储） */
void Create(SSTable *T)
{
    int i;
    T->R = (ElemType *)malloc((MAXSIZE + 1) * sizeof(ElemType));
    scanf("%d", &T->length);
    for(i = 1; i <= T->length; i++)
        scanf("%d", &T->R[i].key);
}

int Search_Bin(SSTable T, KeyType k);

int main()
{
    SSTable T;
    KeyType k;
    Create(&T);
    scanf("%d", &k);
    int pos = Search_Bin(T, k);
    if(pos == 0)
        printf("NOT FOUND\n");
    else
        printf("%d\n", pos);
    free(T.R);
    return 0;
}

/* 在有序顺序表上执行二分查找 */
int Search_Bin(SSTable T, KeyType k)
{
    int low = 1, high = T.length;
    while(low <= high)
    {
        int mid = (low + high) / 2;     /* 取中点 */
        if(T.R[mid].key == k)
            return mid;                 /* 找到 */
        else if(T.R[mid].key > k)
            high = mid - 1;             /* 目标在左半区 */
        else
            low = mid + 1;              /* 目标在右半区 */
    }
    return 0;                           /* 未找到 */
}
```

## 代码流程说明

### 1. 主函数 & 建表
- Create：读 length → 依次读 R[1..length].key
- 再读 k，调用 Search_Bin(T, k)
- pos==0 → 打印 NOT FOUND；否则打印 pos

### 2. Search_Bin 初始化
- low = 1，high = T.length（1 起下标闭区间）

### 3. while (low <= high) 主循环
- mid = (low + high)/2：取中点（向下取整）
- 三路分支：
  - 命中 → return mid
  - 中点值太大 → high = mid - 1
  - 中点值太小 → low = mid + 1

### 4. 循环退出
- low > high 表示区间已空 → return 0

## 代码流程图

```mermaid
flowchart TD
  A["开始\nSearch_Bin(T, k)"] --> B["low=1\nhigh=T.length"]
  B --> C{"low <= high ?"}
  C -- "是" --> D["mid = (low+high)/2"]
  D --> E{"R[mid].key vs k"}
  E -- "==" --> F["return mid"]
  E -- ">" --> G["high = mid - 1"]
  E -- "<" --> H["low = mid + 1"]
  G --> C
  H --> C
  C -- "否" --> I["return 0"]
  F --> J["结束"]
  I --> J
```

## 解题流程图

```mermaid
flowchart TD
  A["开始"] --> B["读入长度 n 和有序序列 R[1..n]"]
  B --> C["读入待查关键字 k"]
  C --> D["low=1, high=n"]
  D --> E{"low <= high ?"}
  E -- "是" --> F["mid = (low+high)/2"]
  F --> G{"R[mid] == k ?"}
  G -- "是" --> H["输出 mid"]
  G -- "否" --> I{"R[mid] > k ?"}
  I -- "是" --> J["high = mid - 1"]
  I -- "否" --> K["low = mid + 1"]
  J --> E
  K --> E
  E -- "否" --> L["输出 NOT FOUND"]
  H --> M["结束"]
  L --> M
```
