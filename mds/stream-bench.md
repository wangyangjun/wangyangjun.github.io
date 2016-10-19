## StreamBench: Stream Processing Systems Benchmark
---
### Introduction
As stream processing systems are widely used in IT industry and there is no good benchmark tool for stream processing systems, we developed one to facilitate performance comparisons: Apache Storm, Apache Flink and Apache Spark Streaming. A key feature of the StreamBench framework is that it is extensible -- it supports easy definition of new workloads, in addition to making it easy to benchmark new stream processing systems.

Storm 0.10.0, and Flink 0.10.1 show sub-second latencies with Storm having the lowest 99th percentile latency. While Flink achieves much better throughput than Storm. Spark streaming 1.5.1 supports high throughputs, but at a relatively higher latency. 

This project is my master [thesis](./master_thesis.pdf) project in Aalto university. The source code could be found in this [repository](https://github.com/wangyangjun/StreamBench).


### Architecture
The benchmark is a java program consuming data from partitioned kafka topic and executing workloads on stream processing cluster. The architecture of StreamBench is shown as following figure. The core of the architecture is ```StreamBench API``` which contains a set of common stream processing APIs, such as ```map```, ```mapToPair```, ```filter```, ```reduce```. For example, API ```mapToPair``` maps a normal data stream to a keyed data stream, and API ```filter``` is a method with a parameter of boolean function and evaluates this boolean function for each element and retains those for which the function returns true.

![Alt Text](images/stream-bench/benchmark_architecture.png)

StreamBench API could be engined by different stream processing systems. Currently we support these APIs on three stream processing systems: Storm, Flink and Spark Streaming. It is very convenient to implement most interfaces of StreamBench API on Flink and Spark Streaming which have similar high level APIs. But there are also some APIs that Flink and/or Spark Streaming doesn’t support well. For example, currently, Flink join operator only supports two streams joining on the same size window time. Therefore, we implemented another version [join](https://github.com/wangyangjun/flink-stream-join) operator discussed with Flink’s low level API. Compare to Flink and Spark Streaming, Storm is more flexible by providing two low level APIs: spout and bolt. Bolts represent the processing logic unit in Storm. One can utilize bolts to do any kind of processing such as filtering, aggregating, joining, interacting with data stores, and talking to external systems.

Besides the core java program, the architecture also includes three more components: Cluster Deploy, Data Generator and Statistic. Cluster deploy scripts help us to setup experiment environment easily. Data generators generate test data for workloads and send it to kafka cluster. The Statistic component includes experiment logging and performance statistic.

### Workloads
With these common stream processing APIs, we implemented three workloads to benchmark performance of stream processing systems in different aspects. WordCount aims to evaluate the performance of stream processing systems performing basic operators. Workload AdvClick to benchmark two keyed streams joining operation. To check the performance of iterate operator, there is a workload to calculate k-means of a point stream.

#### WordCount 
Stream WordCount is implemented with basic operations which are supported by almost all stream processing systems. It means either the system has such operations by default or the operations could be implemented with provided built-in APIs. Other basic operations include ***flatMap***, ***mapToPair*** and ***filter*** which are similar to ***map*** and could be implemented by specializing ***map*** if not supported by default. The pseudocode of WordCount implemented with StreamBench APIs could be abstracted as following algorithm:
```java
sentenceStream.flatMap(...)
              .mapToPair(...)
              .reduceByKey(...)
              .updateStateByKey(...)
``` 

One special case of the basic APIs is updateStateByKey. Only in Spark Streaming there is a corresponding built-in operation. As the computing model of Spark Streaming is micro-batch which is different with that of other stream processing systems. The results of operation reduceByKey of WordCount running in Spark Streaming is word counts of one single micro batch data set. Operation updateStateByKey is used to accumulate word counts in Spark Streaming. Because the model of Flink and Storm is stream processing and accumulated word counts are returned from reduceByKey directly. Therefore, when implementing the API updateStateByKey with Flink and Storm engine, nothing need to do.

When dealing with skewed data, the compute node which count the word with largest frequency might be the bottleneck. Inspired from MapReduce combiner, we designed another version of WordCount with window operator of stream processing. Windows are typically groups of events within a certain time period. In the reduce step of Windowed WordCount, first words are shuffle grouped and applied pre-aggregation. In a certain time period, local pre-aggregation results are stored at local compute nodes. At the end of a window time, the intermedia word counts are key grouped and reduced to get the final results. The computation of window WordCount could be shown as below:
![Alt Text](images/stream-bench/window_wordcount.png)


#### AdvClick 
Another typical type of stream use case is processing joins over two input streams. Theoretically unbounded memory is required to processing join over unbounded input streams, since every record in one in-finite stream must be compared with every record in the other. As the memory of a machine is limited, we need restrict the number of records stored for each stream with a time window.

A window join takes two key-value pair streams, say stream *S1* and stream *S2*, along with windows with the same slide size for both *S1* and *S2* as input. Each record in *S1* is a tuple of pair ```(k, v1)``` with k as the primary key. The key in Stream *S2*:```(k, v2)``` is a foreign key referencing primary key in *S1*. The output of join operator is a stream of tuple ```(k, v1, v2)```. This primary key join operation could be described as a SQL query illustrated as following algorithm.

``` sql
SELECT S1.k, S1.v1, S2.v2 2: FROM S1
INNER JOIN S2
ON S1.k = S2.k
```

Assuming a sliding window join between stream S1 and stream S2, a new tuple arrival from stream S2, then a summary of steps to preform join is the following:

1. Scan window of stream S1 to find any tuple which has the same key with this new tuple and propagate the result;
2. (a) Invalidate target tuple in stream S1 ’s window if found;  
   (b) If not, insert the new tuple into stream S2 ’s window
3. Invalidate all expired tuples in stream S2 ’s window.

The join operator could be described as following figure:
![Alt Text](images/stream-bench/join.png)

To evaluate performance of join operator in stream processing systems, we designed a workload called AdvClick which joins two streams in a online advertisement system. Every second there are a huge number of web pages opened which contain advertisement slots. A corresponding stream of shown advertisements is generated in the system. Each record in the stream could be simply described as a tuple of ```(id, shown time)```. Some of advertisements would be clicked by users and clicked advertisements is a stream which could be abstracted as a unbounded tuples of ```(id, clicked time)```. Normally, if an advertisement is attractive to a user, the user would click it in a short time after it is shown. We call such a click of an attractive advertisement valid click. To bill a customer, we need count all valid clicks regularly for advertisements of this customer. That could be counted after joining stream advertisement clicks and stream shown advertisements.

![Alt Text](images/stream-bench/spark_join_repeat.png)  
Since Spark Streaming doesn’t process tuples in a stream one by one, the join operator in Spark Streaming has different behaviours. In each batch interval, the RDD generated by stream1 will be joined with the RDD generated by stream2. For windowed streams, as long as slide durations of two windowed streams are the same, in each slide duration, the RDDs generated by two windowed streams will be joined. Because of this, window join in Spark Streaming could only make sure that a tuple in one stream will always be joined with corresponding tuple in the other stream that arrived earlier up to a configureable window time. Otherwise, repeat joined tuples would exist in generated RDDs of joined stream. As above figure show, a tuple in Stream2 could be always joined with a corresponding tuple in Stream1 that arrived up to 2 seconds earlier. Since the slide duration of Stream2 is equal to its window size, no repeat joined tuple exists. On the other hand, it is possible that a tuple arrives earlier from Stream2 than the corresponding tuple in Stream1 couldn’t be joined. The figure below exemplifies that there are tuples joined repeatedly when slide duration of Stream2 is not equal to its window size.  
![Alt Text](images/stream-bench/spark_join_norepeat.png)

#### K-Means

Iterative algorithms occur in many domains of data analysis, such as machine learning or graph analysis. Many stream data processing tasks require iterative sub-computations as well. These require a data processing system having the capacity to perform iterative processing on a real-time data stream. To achieve iterative sub-computations, low-latency interactive access to results and consistent intermediate outputs, Murray introduced a computational model named timely dataflow that is based on a directed graph in which stateful vertices send and receive logically timestamped messages along directed edges. The dataflow graph may contain nested cycles and the timestamps reflect this structure in order to distinguish data that arise in different input epochs and loop iterations. With iterate operator, many stream processing systems already support such nested cycles in processing data flow graph. We designed a workload named stream k-means to evaluate iterate operator in stream processing systems.

K-means is a clustering algorithm which aims to partition n points into k clusters in which each point belongs to the cluster with the nearest mean, serving as a prototype of the cluster. Given an initial set of k means, the algorithm proceeds by alternating between two steps:

*	Assignment step: assign each point to the cluster whose mean yields the least within-cluster sum of squares.
*	Update step: Calculate the new means to be the centroids of the points in the new clusters.  

![Alt Text](images/stream-bench/iterator_operator.png)

The algorithm has converged when the assignments no longer change. We apply k-means algorithm on a stream of points with an iterate operator to update centroids. Spark executes data analysis pipeline using directed acyclic graph sched- uler. Nested cycle doesn’t exist in the data pipeline graph. Therefore, this workload will not be used to benchmark Spark Streaming. Instead, a standalone version of k-means application is used to evaluate the performance of Spark Streaming.


### Experiment Environment Setup
#### Hardware and Software
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

#### Setup script
To deploy these software in compute cluster and kafka cluster automatically, we developed a set of python script. The prerequisites of using these scripts include internet access, ssh passwordless login between nodes in cluster and cluster configuration that describes which nodes are compute node or kafka node and where is the master node. The basic logic of deploy scripts is to download softwares online and install them, then replace configure files which are contained in a Github repository. For detail information of how to use cluster deploy scripts and configure of Storm, Flink, Spark and Kafka, please check this [Github repository](https://github.com/wangyangjun/StreamBench/tree/master/script).


### Environment Results

#### Logging and Statics
There are two performance measurement terms used in StreamBench that are latency and throughput. Latency is the required time from a record entering the system to some results produced after some actions performed on the record. In StreamBench, messaging system and stream processing system are combined together and treated as one single system. The latency is computed start from when a record is generated. The following figure shows how latency computed in StreamBench. In our experiments, we noticed that in the beginning of processing data, the performance of Storm cluster is bad. That leads to high latency of records in the head of a stream. Therefore, we ignored latency logs of first 1 minute in our statistic.
![Alt Text](images/stream-bench/latency.png)  

Throughput is the number of actions executed or results produced per unit of time. In the WordCount workload, throughput is computed as the number of words counted per seconds in the whole compute cluster. Joined click events and the number of points processed per second are the throughput of workloads AdvClick and Stream KMeans respectively.
There is an inherent tradeoff between latency and throughput: on a given hardware setup, as the amount of load increases by increase the speed of data generation, the latency of individual records increases as well since there is more contention for disk, CPU, network, and so on. Computing latency start from records generated makes it easy to measure the highest throughput, since records couldn’t produced in time will stay in kafka topics that increase latency dramatically. A stream processing system with better performance will achieve low latency and high throughput with fewer servers.

#### WordCount Results
To achieve the best throughput of Flink and Storm running this workload, we did some experiments called Offline WordCount. In these experiments, first we generated enough data deisgned for this workload and wrote it to kafka topic, then launched Storm/Flink work count application. The experiment results indicate that Flink achieves significant higher throughput that Storm. The throughput of Flink cluster dealing with uniform data stream is very high and reaches 2.83 M/s(million words per second), which is more than two times as large as throughput of performing skewed data. While the throughput of storm processing uniform data stream is only around 27 K/s.   
Since the computing model of Spark Streaming is micro-batch processing, existing data in Kafka cluster would be collected and processed as one single batch. The performance of processing one large batch with Spark Streaming is similar to a Spark batch job. There are already many works evaluating performance of Spark batch processing. Therefore, we skip experiments of Spark Streaming here.  


The following figure shows the latecny of these thress systems performing skewed data. Storm with ack enabled achieves a median latency of 10 milliseconds, and a 95-th percentile latency of 201 milliseconds, meaning that 95% of all latencies were below 201 milliseconds. Flink has a higher median latency (39 milliseconds), and a similar 95-th percentile latency of 217 milliseconds. Since the records in a micro-batch are buffered up to batch interval time, the buffer time are also counted into the latency according to our latency computational method. For example, median latency of Spark Streaming is equal to the sum of median latency of micro-batches and half of micro-batch interval. Obviously, the latency of Spark Streaming is much higher than that of others.  
![Alt Text](images/stream-bench/latency_skewedwordcount.png)  

In Spark Streaming, depending on the nature of the streaming computation, the batch interval used may have significant impact on the data rates that can be sustained by the application on a fixed set of cluster resources1. Here, we perform the experiments with one second micro-batch interval and 10 seconds checkpoint interval which are the default configurations. Checkpointing is enabled because of a stateful transformation, ```updateStateByKey``` is used here to accumulate word counts. Checkpointing is very time consuming due to writing information to a faulttolerant storage system.
Before the computation of a micro-batch is finished, computation job of following micro-batches will not start. Therefore, the start time of computation job of a micro-batch would be delayed, this is indicated by “Delay” in the figure. The throughput of Spark Streming experiments is 1.4M/s (million words per second) of skewed data. When the speed of data generation reaches 1.8M/s, the delay and latency increase infinitely with periodic decreasing.

![Alt Text](images/stream-bench/spark_wordcount_latency.png)  

#### AdvClick Results
As described in § 4.4.2, click delays of clicked advertisements satisfy normal distribution and the mean is set to 10 seconds. In our experiments, we define that clicks within 20s after corresponding advertisement shown are valid clicks. In theory, overwhelming majority records in the click stream could be joined. Kafka only provides a total order over messages within a partition, not between di↵erent partitions in a topic [17]. Therefore, it is possible that click record arrives earlier than corresponding advertisement shown record. We set a window time of 5 seconds for advertisement clicks stream, as acking a tuple would require knowing whether it will be joined with a corresponding one from the other stream in the future.
When benchmarking Storm and Flink, first we perform experiments with low speed data generation, and then increase the speed until obvious joining failures occur when throughput is much less than generation speed of stream advertisement clicks. The experiment result shows that the maximum throughput of Storm cluster is around 8.4K/s (joined events per second). The corresponding generation speed of shown advertisements is 28K/s. As we can see in Figure 5.5(a), cluster throughput of shown advertisements is equal to the data generation speed when it is less than 28K/s. That means there is no join failures. Figure 5.5(a) also shows that Storm cluster has a very low median latency. But the 99-th percentile of latency is much higher and increase dramatically with the data generation speed.

Compared to Storm, Flink achieves a much better throughput. In our experiments, the throughput of Flink cluster is always equal to the generation speed of stream shown advertisements. But when the generation speed of stream shown advertisements is larger than 200K/s, the Flink AdvClick processing job is usually failed because of a bug in flink-connector-kafka 3. This issue is fixed in the latest versions of Flink and Kafka. But Storm and Spark don’t support the latest version of Kafka yet. We will upgrade all these systems in StreamBench in the next version of StreamBench. The maximum throughput of Flink we achieved in experiments is 63K/s (joined events per second), around 6 times larger than Storm. The latency of Flink performing this workload is shown as Figure 5.5(b). Even though the median latencies are a little higher than Storm, but 90-th and 99-th percentiles of Flink latency are much lower.

As discussed in § 4.3.2, Spark Streaming join operator is applied with sliding window. With the configuration of 20s/5s, the slide intervals of both windows are 5 seconds. That means a micro-batch join job is submitted to Spark Streaming cluster every 5 seconds. Because of di↵erent processing model, there is no joining failure in Spark Streaming. But high data genera- tion speed leads to increasing delay of micro-batch jobs, because micro-batch jobs couldn’t be finished in interval time. With this configuration, Spark Streaming has a very small throughput which is lower than 2K/s. Increas- ing micro-batch jobs submitting interval might increase the throughput, but leads to higher latency. For this workload, increasing the window lengths also because of the presence of duplicate records, as the windows overlap. Therefore, we did some experiments with larger windows. Increasing win- dows length of these two streams to 60s/30s, the cluster could achieve a throughput of 20K/s which is ten times larger.

Table 5.2 summarizes maximum throughputs and latencies at a specific throughput of these systems. Flink achieves the largest throughput and lowest 90-th percentile latency. While the median latency of Storm is 14ms, that is much lower than other systems. Latencies of Spark Streaming shown in the table is the latencies of micro-batches that doesn’t include bu↵er time of records in a window.
![Alt Text](images/stream-bench/adv_click_table.png)  




