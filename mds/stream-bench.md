## StreamBench: Stream Processing Systems Benchmark
---
### Introduction
As stream processing systems are widely used in IT industry and there is no good benchmark tool for stream processing systems, we developed one to facilitate performance comparisons: Apache Storm, Apache Flink and Apache Spark Streaming. A key feature of the StreamBench framework is that it is extensible -- it supports easy definition of new workloads, in addition to making it easy to benchmark new stream processing systems.

Storm 0.10.0, and Flink 0.10.1 show sub-second latencies with Storm having the lowest 99th percentile latency. Flink achieves much better throughput than Storm. Spark streaming 1.5.1 supports high throughputs, but at a relatively higher latency. 

This project is my master [thesis](./master_thesis.pdf) project in Aalto university. The source code could be found in this [repository](https://github.com/wangyangjun/StreamBench).

### Benchmark Design

#### Architecture
The main component of StreamBench is a Java program consuming data from partitioned kafka topic and executing workloads on stream processing cluster. The architecture of StreamBench is shown as following figure. The core of the architecture is StreamBench API which contains a set of common stream processing APIs. For example, API mapToPair maps a normal data stream to a keyed data stream, and API filter is a method with a parameter of boolean function and evaluates this boolean function for each element and retains those for which the function returns true.

![Alt Text](images/benchmark_architecture.png)

StreamBench API could be engined by different stream processing systems. Currently we support these APIs on three stream processing systems: Storm, Flink and Spark Streaming. It is very convenient to implement most interfaces of StreamBench API on Flink and Spark Streaming which have similar high level APIs. But there are also some APIs that Flink and/or Spark Streaming doesn’t support well. For example, currently, Flink join operator only supports two streams joining on the same size window time. Therefore, we implemented another version join operator discussed with Flink’s low level API. Compare to Flink and Spark Streaming, Storm is more flexible by providing two low level APIs: spout and bolt. Bolts represent the processing logic unit in Storm. One can utilize bolts to do any kind of processing such as filtering, aggregating, joining, interacting with data stores, and talking to external systems.

With these common stream processing APIs, we implemented three workloads to benchmark performance of stream processing systems in different aspects. WordCount aims to evaluate the performance of stream processing systems performing basic operators. Workload AdvClick to benchmark two keyed streams joining operation. To check the performance of iterate operator, there is a workload to calculate k-means of a point stream.

Besides the core Java program, the architecture also includes three more components: Cluster Deploy, Data Generator and Statistic. Cluster deploy scripts help us to setup experiment environment easily. Data generators generate test data for workloads and send it to kafka cluster. The Statistic component includes experiment logging and performance statistic.

  
### Experiment Environment Setup
The experiment environment consists of two clusters: compute clusting and Kafka cluster.
*   computing cluster -- 9 nodes (8 worknodes, 1 mastnode)
*   kafka cluster -- 5 brokers(one zokeeper instance running in one of them)

Each Virtual machine(node):
*   4 CPU cores
*   15GB RAM
*   10GB root disk and 220GB ephemeral disk
*	Ubuntu 14.04 LTS

Selected software packages used in the experiments:
*   Spark-1.5.1
*   Storm-0.10.0
*   Flink-0.10.1
*	Kafka 0.8.2.1
*	Hadoop2.6(HDFS to enable checkpoint feature of Spark)

To deploy these software in compute cluster and kafka cluster automatically, we developed a set of python script. The prerequisites of using these scripts include internet access, ssh passwordless login between nodes in cluster and cluster configuration that describes which nodes are compute node or kafka node and where is the master node. The basic logic of deploy scripts is to download softwares online and install them, then replace configure files which are contained in a Github repository. For detail information of how to use cluster deploy scripts and configure of Storm, Flink, Spark and Kafka, please check this [Github repository](https://github.com/wangyangjun/StreamBench/tree/master/script).


### Workloads and Environment Results
**WordCount**  
Stream WordCount is implemented with basic operations which are supported by almost all stream processing systems. It means either the system has such operations by default or the operations could be implemented with provided built-in APIs. Other basic operations include ***flatMap***, ***mapToPair*** and ***filter*** which are similar to ***map*** and could be implemented by specializing ***map*** if not supported by default. The pseudocode of WordCount implemented with StreamBench APIs could be abstracted as following algorithm:
```java
sentenceStream.flatMap(...)
              .mapToPair(...)
              .reduceByKey(...)
              .updateStateByKey(...)
``` 

One special case of the basic APIs is updateStateByKey. Only in Spark Streaming there is a corresponding built-in operation. As discussed in Sec- tion 3.3, the computing model of Spark Streaming is micro-batch which is different with that of other stream processing systems. The results of op- eration reduceByKey of WordCount running in Spark Streaming is word counts of one single micro batch data set. Operation updateStateByKey is used to accumulate word counts in Spark Streaming. Because the model of Flink and Storm is stream processing and accumulated word counts are re- turned from reduceByKey directly. Therefore, when implementing the API updateStateByKey with Flink and Storm engine, nothing need to do.

When dealing with skewed data, the compute node which count the word with largest frequency might be the bottleneck. Inspired from MapReduce Combiner, we designed another version of WordCount with window operator of stream processing. Windows are typically groups of events within a certain time period. In the reduce step of Windowed WordCount, first words are shuffle grouped and applied pre-aggregation. In a certain time period, local pre-aggregation results are stored at local compute nodes. At the end of a window time, the intermedia word counts are key grouped and reduced to get the final results.

