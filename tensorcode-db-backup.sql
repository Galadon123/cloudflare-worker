PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "categories" VALUES(2,'Machine Learning','machine-learning','2025-11-05 06:31:51','2025-11-05 06:31:51');
INSERT INTO "categories" VALUES(3,'Deep Learning','deep-learning','2025-11-05 12:09:37','2025-11-05 12:09:37');
CREATE TABLE subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(slug, category_id)
);
INSERT INTO "subcategories" VALUES(1,'Convolutional Neural Networks','cnn',2,'2025-11-05 06:33:05','2025-11-05 06:33:05');
INSERT INTO "subcategories" VALUES(2,'Linear Regression','linear-regression',3,'2025-11-05 12:10:58','2025-11-05 12:10:58');
INSERT INTO "subcategories" VALUES(3,'Linear Regression 1','linear-regression-1',3,'2025-11-06 12:26:12','2025-11-06 12:26:12');
CREATE TABLE chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    subcategory_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
    UNIQUE(slug, subcategory_id)
);
INSERT INTO "chapters" VALUES(1,'Advanced CNN Architectures','advanced-cnn',1,'2025-11-05 06:34:04','2025-11-05 06:34:04');
INSERT INTO "chapters" VALUES(2,'Introduction to CNNs','intro-to-cnns',1,'2025-11-06 12:28:31','2025-11-06 12:28:31');
CREATE TABLE problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
    has_tinygraded BOOLEAN NOT NULL DEFAULT 0,
    has_pytorch BOOLEAN NOT NULL DEFAULT 0,
    requires_gpu BOOLEAN NOT NULL DEFAULT 0,
    problem_type TEXT NOT NULL,
    collection_type TEXT NOT NULL DEFAULT 'problems',
    repository TEXT NOT NULL,
    chapter_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);
INSERT INTO "problems" VALUES(1,'Build a Simple CNN','medium',1,1,0,'coding','problems','cnn-basics',1,'2025-11-05 06:34:39','2025-11-05 06:34:39');
INSERT INTO "problems" VALUES(2,'Build a Simple CNN 1','medium',1,1,0,'coding','problems','cnn-basics',1,'2025-11-06 12:29:33','2025-11-06 12:29:33');
CREATE TABLE labs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
    has_tinygraded BOOLEAN NOT NULL DEFAULT 0,
    has_pytorch BOOLEAN NOT NULL DEFAULT 0,
    requires_gpu BOOLEAN NOT NULL DEFAULT 0,
    problem_type TEXT NOT NULL,
    collection_type TEXT NOT NULL DEFAULT 'labs',
    repository TEXT NOT NULL,
    chapter_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);
INSERT INTO "labs" VALUES(1,'CNN Image Classification Lab','medium',0,1,1,'lab','labs','image-classification-lab',1,'2025-11-05 06:36:15','2025-11-05 06:36:15');
CREATE TABLE roadmaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roadmap_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('foundation', 'intermediate', 'advanced')),
  estimated_hours INTEGER,
  official_docs TEXT,
  icon TEXT,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "roadmaps" VALUES(6,'pytorch','PyTorch','Complete PyTorch Course','Learn PyTorch from scratch','intermediate',50,'https://pytorch.org/','🚀','1.0.0','active','2025-11-20','2025-11-20 10:15:34','2025-12-14 14:56:53');
INSERT INTO "roadmaps" VALUES(7,'numpy','numpy','Complete NumPy Course','Master NumPy from fundamentals to advanced numerical computations','foundation',25,'https://numpy.org/doc/','🔢','1.0.0','active','2025-11-27','2025-11-27 08:47:48','2025-11-27 09:30:50');
INSERT INTO "roadmaps" VALUES(8,'triton','triton','Triton','Triton is a high-performance computing framework for deep learning','foundation',25,'https://triton-lang.org/docs/','🔢','1.0.0','active','2025-12-04','2025-12-04 15:41:02','2025-12-04 15:41:02');
INSERT INTO "roadmaps" VALUES(13,'cuda','cuda','Complete CUDA Course','Master CUDA from fundamentals to advanced GPU programming','foundation',25,'https://developer.nvidia.com/cuda-toolkit','🔢','1.0.0','active','2025-12-09','2025-12-09 13:29:57','2025-12-20 18:22:14');
CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id TEXT NOT NULL,
  roadmap_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_hours INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'coming_soon', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(roadmap_id) ON DELETE CASCADE,
  UNIQUE(roadmap_id, module_id)
);
INSERT INTO "modules" VALUES(15,'building-pytorch-from-scratch','pytorch','building-pytorch-from-scratch','Building PyTorch from Scratch',1,0,NULL,'live','2025-11-20 10:43:51','2025-11-20 10:43:51');
INSERT INTO "modules" VALUES(16,'numpy-fundamentals','numpy','numpy-fundamentals','Core NumPy concepts including arrays, data manipulation, and numerical computations',1,0,NULL,'live','2025-11-27 08:48:07','2025-11-27 08:48:07');
INSERT INTO "modules" VALUES(17,'triton-programming','triton','triton-programming','Triton programming language fundamentals',1,0,NULL,'live','2025-12-04 15:45:44','2025-12-04 15:45:44');
INSERT INTO "modules" VALUES(23,'introduction-to-deep-learning-with-pytorch','pytorch','introduction-to-deep-learning-with-pytorch','Introduction to Deep Learning with PyTorch',2,0,NULL,'live','2025-12-14 14:11:33','2025-12-14 14:11:33');
INSERT INTO "modules" VALUES(24,'cuda-programming','cuda','cuda-programming','Complete CUDA Programming Course from Foundations to Advanced Kernels',1,0,NULL,'live','2025-12-19 15:49:13','2025-12-19 15:49:13');
CREATE TABLE roadmap_chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  roadmap_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_hours INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT DEFAULT 'coming_soon' CHECK (status IN ('live', 'coming_soon', 'archived')),
  prerequisites TEXT DEFAULT '[]',
  learning_objectives TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(roadmap_id, module_id, chapter_id)
);
INSERT INTO "roadmap_chapters" VALUES(3,'foundations','building-pytorch-from-scratch','pytorch','foundations','Mathematical foundations and basic activation functions',1,0,'easy','coming_soon','[]','[]','2025-11-20 10:54:02','2025-11-20 10:54:02');
INSERT INTO "roadmap_chapters" VALUES(4,'tensor-operations','building-pytorch-from-scratch','pytorch','tensor-operations','Core tensor operations, storage, and broadcasting',2,0,'medium','coming_soon','[]','[]','2025-11-20 10:54:22','2025-11-20 10:54:22');
INSERT INTO "roadmap_chapters" VALUES(5,'automatic-differentiation','building-pytorch-from-scratch','pytorch','automatic-differentiation','Scalar autodiff and torch.autograd API implementation',3,0,'hard','coming_soon','[]','[]','2025-11-20 10:54:44','2025-11-20 10:54:44');
INSERT INTO "roadmap_chapters" VALUES(6,'building-networks','building-pytorch-from-scratch','pytorch','building-networks','Module system, neural networks, and softmax',4,0,'medium','coming_soon','[]','[]','2025-11-20 10:54:50','2025-11-20 10:54:50');
INSERT INTO "roadmap_chapters" VALUES(7,'convolutional-layers','building-pytorch-from-scratch','pytorch','convolutional-layers','Conv1D, Conv2D, and pooling operations',5,0,'hard','coming_soon','[]','[]','2025-11-20 10:55:06','2025-11-20 10:55:06');
INSERT INTO "roadmap_chapters" VALUES(8,'training','building-pytorch-from-scratch','pytorch','training','Loss functions, optimizers, and training loops',6,0,'medium','coming_soon','[]','[]','2025-11-20 10:55:13','2025-11-20 10:55:13');
INSERT INTO "roadmap_chapters" VALUES(9,'numpy-array-essentials','numpy-fundamentals','numpy','numpy-array-essentials','Fundamentals of NumPy arrays including creation, indexing, slicing, and reshaping',1,0,'easy','coming_soon','[]','[]','2025-11-27 08:48:17','2025-11-27 08:48:17');
INSERT INTO "roadmap_chapters" VALUES(10,'data-manipulation-techniques','numpy-fundamentals','numpy','data-manipulation-techniques','Advanced data manipulation including aggregation methods, axis operations, and keepdims parameter',2,0,'easy','coming_soon','[]','[]','2025-11-27 08:48:24','2025-11-27 08:48:24');
INSERT INTO "roadmap_chapters" VALUES(11,'numerical-computations','numpy-fundamentals','numpy','numerical-computations','Advanced numerical operations including cumulative operations, vectorization, and broadcasting',3,0,'medium','coming_soon','[]','[]','2025-11-27 08:48:30','2025-11-27 08:48:30');
INSERT INTO "roadmap_chapters" VALUES(12,'understand-triton-programming-model','triton-programming','triton','understand-triton-programming-model','Understand Triton programming model',1,0,'easy','coming_soon','[]','[]','2025-12-04 17:28:20','2025-12-04 17:28:20');
INSERT INTO "roadmap_chapters" VALUES(13,'write-triton-kernels-for-ml-operations','triton-programming','triton','write-triton-kernels-for-ml-operations','Write Triton kernels for ML operations',2,0,'medium','coming_soon','[]','[]','2025-12-04 17:29:04','2025-12-04 17:29:04');
INSERT INTO "roadmap_chapters" VALUES(20,'pytorch-foundations','introduction-to-deep-learning-with-pytorch','pytorch','pytorch-foundations','PyTorch Foundations',1,0,NULL,'coming_soon','[]','[]','2025-12-19 13:26:43','2025-12-19 13:26:43');
INSERT INTO "roadmap_chapters" VALUES(21,'network-architecture','introduction-to-deep-learning-with-pytorch','pytorch','network-architecture','Neural Network Architecture',2,0,NULL,'coming_soon','[]','[]','2025-12-19 13:28:29','2025-12-19 13:28:29');
INSERT INTO "roadmap_chapters" VALUES(22,'forward-propagation','introduction-to-deep-learning-with-pytorch','pytorch','forward-propagation','Forward Propagation',3,0,NULL,'coming_soon','[]','[]','2025-12-19 13:28:40','2025-12-19 13:28:40');
INSERT INTO "roadmap_chapters" VALUES(23,'training-pipeline','introduction-to-deep-learning-with-pytorch','pytorch','training-pipeline','Training Pipeline',4,0,NULL,'coming_soon','[]','[]','2025-12-19 13:28:57','2025-12-19 13:28:57');
INSERT INTO "roadmap_chapters" VALUES(25,'foundations','cuda-programming','cuda','foundations','CUDA Foundations - Parallel Computing and Core Concepts',1,0,NULL,'coming_soon','[]','[]','2025-12-20 18:05:06','2025-12-20 18:05:06');
INSERT INTO "roadmap_chapters" VALUES(26,'cuda-programming-model','cuda-programming','cuda','cuda-programming-model','CUDA Programming Model - Kernels, Threads, and Organization',2,0,NULL,'coming_soon','[]','[]','2025-12-20 18:12:16','2025-12-20 18:12:16');
INSERT INTO "roadmap_chapters" VALUES(27,'memory-hierarchy','cuda-programming','cuda','memory-hierarchy','CUDA Memory Hierarchy - Types and Management',3,0,NULL,'coming_soon','[]','[]','2025-12-20 18:16:36','2025-12-20 18:16:36');
INSERT INTO "roadmap_chapters" VALUES(28,'memory-optimization','cuda-programming','cuda','memory-optimization','Advanced Memory Optimization Techniques',4,0,NULL,'coming_soon','[]','[]','2025-12-20 18:19:32','2025-12-20 18:19:32');
INSERT INTO "roadmap_chapters" VALUES(29,'basic-cuda-kernels','cuda-programming','cuda','basic-cuda-kernels','Implementing Fundamental CUDA Kernels',5,0,NULL,'coming_soon','[]','[]','2025-12-20 18:21:13','2025-12-20 18:21:13');
CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  roadmap_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'lesson' CHECK (type IN ('lesson', 'lab', 'problem')),
  duration TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'coming_soon', 'archived')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT,
  content TEXT,
  prerequisites TEXT DEFAULT '[]',
  learning_objectives TEXT DEFAULT '[]',
  resources TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(roadmap_id, module_id, chapter_id, lesson_id)
);
INSERT INTO "lessons" VALUES(3,'tensor-operations','tensor-operations','building-pytorch-from-scratch','pytorch','tensor-operations','lesson','60 minutes',1,'live','medium','Tensor Operations: Arithmetic and Reductions','Lab 10: Tensor Operations: Arithmetic and Reductions','[]','[]','[]','2025-11-20 11:15:07','2025-11-20 11:15:07');
INSERT INTO "lessons" VALUES(4,'matrix-operations','tensor-operations','building-pytorch-from-scratch','pytorch','matrix-operations','lesson','60 minutes',2,'live','medium','Matrix Operations','Lab 11: Matrix Operations','[]','[]','[]','2025-11-20 11:15:12','2025-11-20 11:15:12');
INSERT INTO "lessons" VALUES(5,'activation-functions-operations','tensor-operations','building-pytorch-from-scratch','pytorch','activation-functions-operations','lesson','45 minutes',3,'live','medium','Activation Functions','Lab 12: Activation Functions','[]','[]','[]','2025-11-20 11:15:18','2025-11-20 11:15:18');
INSERT INTO "lessons" VALUES(6,'shape-operations','tensor-operations','building-pytorch-from-scratch','pytorch','shape-operations','lesson','45 minutes',4,'live','medium','Shape Operations','Lab 13: Shape Operations','[]','[]','[]','2025-11-20 11:15:26','2025-11-20 11:15:26');
INSERT INTO "lessons" VALUES(7,'complete-tensor-api','tensor-operations','building-pytorch-from-scratch','pytorch','complete-tensor-api','lesson','90 minutes',5,'live','hard','Complete Tensor API','Lab 14: Complete Tensor API','[]','[]','[]','2025-11-20 11:15:30','2025-11-20 11:15:30');
INSERT INTO "lessons" VALUES(8,'module-system','building-networks','building-pytorch-from-scratch','pytorch','module-system','lesson','60 minutes',1,'live','medium','The Module System','Lab 15: The Module System','[]','[]','[]','2025-11-20 11:15:50','2025-11-20 11:15:50');
INSERT INTO "lessons" VALUES(9,'first-neural-network','building-networks','building-pytorch-from-scratch','pytorch','first-neural-network','lesson','75 minutes',2,'live','medium','Building Your First Neural Network','Lab 16: Building Your First Neural Network','[]','[]','[]','2025-11-20 11:15:55','2025-11-20 11:15:55');
INSERT INTO "lessons" VALUES(10,'softmax','building-networks','building-pytorch-from-scratch','pytorch','softmax','lesson','45 minutes',3,'live','medium','Softmax','Lab 17: Softmax','[]','[]','[]','2025-11-20 11:16:00','2025-11-20 11:16:00');
INSERT INTO "lessons" VALUES(11,'loss-functions','training','building-pytorch-from-scratch','pytorch','loss-functions','lesson','60 minutes',1,'live','medium','Loss Functions','Lab 18: Loss Functions','[]','[]','[]','2025-11-20 11:16:04','2025-11-20 11:16:04');
INSERT INTO "lessons" VALUES(12,'sgd-optimizer','training','building-pytorch-from-scratch','pytorch','sgd-optimizer','lesson','60 minutes',2,'live','medium','SGD Optimizer','Lab 19: SGD Optimizer','[]','[]','[]','2025-11-20 11:16:09','2025-11-20 11:16:09');
INSERT INTO "lessons" VALUES(13,'mathematical-foundations','foundations','building-pytorch-from-scratch','pytorch','mathematical-foundations','lesson','30 minutes',1,'live','easy','Basic Mathematical Operations','Lab 1: Basic Mathematical Operations','[]','[]','[]','2025-11-20 11:16:13','2025-11-20 11:16:13');
INSERT INTO "lessons" VALUES(14,'conv1d-fundamentals','convolutional-layers','building-pytorch-from-scratch','pytorch','conv1d-fundamentals','lesson','90 minutes',1,'live','hard','Conv1D Fundamentals','Lab 20: Conv1D Fundamentals','[]','[]','[]','2025-11-20 11:16:20','2025-11-20 11:16:20');
INSERT INTO "lessons" VALUES(15,'conv2d-internals','convolutional-layers','building-pytorch-from-scratch','pytorch','conv2d-internals','lesson','90 minutes',2,'live','hard','Conv2D Internals','Lab 21: Conv2D Internals','[]','[]','[]','2025-11-20 11:16:25','2025-11-20 11:16:25');
INSERT INTO "lessons" VALUES(16,'pooling-operations','convolutional-layers','building-pytorch-from-scratch','pytorch','pooling-operations','lesson','75 minutes',3,'live','hard','Pooling Operations','Lab 22: Pooling Operations','[]','[]','[]','2025-11-20 11:16:32','2025-11-20 11:16:32');
INSERT INTO "lessons" VALUES(17,'custom-autograd-functions','automatic-differentiation','building-pytorch-from-scratch','pytorch','custom-autograd-functions','lesson','60 minutes',1,'live','hard','Custom Autograd Functions','Lab 23: Custom Autograd Functions','[]','[]','[]','2025-11-20 11:17:47','2025-11-20 11:17:47');
INSERT INTO "lessons" VALUES(18,'training-loop','training','building-pytorch-from-scratch','pytorch','training-loop','lesson','60 minutes',3,'live','hard','Neural Network Training Loop','Lab 24: Neural Network Training Loop','[]','[]','[]','2025-11-20 11:17:51','2025-11-20 11:17:51');
INSERT INTO "lessons" VALUES(19,'activation-functions','foundations','building-pytorch-from-scratch','pytorch','activation-functions','lesson','30 minutes',2,'live','easy','Activation Functions','Lab 2: Activation Functions','[]','[]','[]','2025-11-20 11:17:54','2025-11-20 11:17:54');
INSERT INTO "lessons" VALUES(20,'relu-activation','foundations','building-pytorch-from-scratch','pytorch','relu-activation','lesson','30 minutes',3,'live','easy','ReLU Activation Function','Lab 3: ReLU Activation Function','[]','[]','[]','2025-11-20 11:18:19','2025-11-20 11:18:19');
INSERT INTO "lessons" VALUES(21,'sigmoid-activation','foundations','building-pytorch-from-scratch','pytorch','sigmoid-activation','lesson','30 minutes',4,'live','easy','Sigmoid Activation Function','Lab 4: Sigmoid Activation Function','[]','[]','[]','2025-11-20 11:18:23','2025-11-20 11:18:23');
INSERT INTO "lessons" VALUES(22,'tanh-activation','foundations','building-pytorch-from-scratch','pytorch','tanh-activation','lesson','30 minutes',5,'live','easy','Tanh Activation Function','Lab 5: Tanh Activation Function','[]','[]','[]','2025-11-20 11:18:27','2025-11-20 11:18:27');
INSERT INTO "lessons" VALUES(23,'scalar-autodiff','automatic-differentiation','building-pytorch-from-scratch','pytorch','scalar-autodiff','lesson','45 minutes',2,'live','medium','Scalar Autodiff','Lab 6: Scalar Autodiff','[]','[]','[]','2025-11-20 11:18:42','2025-11-20 11:18:42');
INSERT INTO "lessons" VALUES(24,'torch-autograd-api','automatic-differentiation','building-pytorch-from-scratch','pytorch','torch-autograd-api','lesson','60 minutes',3,'live','medium','Build the torch.autograd API','Lab 7: Build the torch.autograd API','[]','[]','[]','2025-11-20 11:18:46','2025-11-20 11:18:46');
INSERT INTO "lessons" VALUES(25,'tensor-storage-internals','tensor-operations','building-pytorch-from-scratch','pytorch','tensor-storage-internals','lesson','45 minutes',6,'live','medium','Tensor Storage Internals','Lab 8: Tensor Storage Internals','[]','[]','[]','2025-11-20 11:18:51','2025-11-20 11:18:51');
INSERT INTO "lessons" VALUES(26,'broadcasting','tensor-operations','building-pytorch-from-scratch','pytorch','broadcasting','lesson','45 minutes',7,'live','medium','Broadcasting','Lab 9: Broadcasting','[]','[]','[]','2025-11-20 11:18:55','2025-11-20 11:18:55');
INSERT INTO "lessons" VALUES(27,'introduction','numpy-array-essentials','numpy-fundamentals','numpy','introduction','lesson','20 minutes',1,'live','easy','Introduction to NumPy library and basic array operations','Learn the fundamentals of NumPy arrays and basic operations','[]','[]','[]','2025-11-27 08:48:38','2025-11-27 08:48:38');
INSERT INTO "lessons" VALUES(28,'indexing-slicing','numpy-array-essentials','numpy-fundamentals','numpy','indexing-slicing','lesson','25 minutes',2,'live','easy','Master array indexing and slicing techniques for data access','Learn how to access and manipulate array elements using indexing and slicing','[]','[]','[]','2025-11-27 08:48:44','2025-11-27 08:48:44');
INSERT INTO "lessons" VALUES(29,'reshaping','numpy-array-essentials','numpy-fundamentals','numpy','reshaping','lesson','25 minutes',3,'live','easy','Learn to reshape arrays and understand memory layout','Master array reshaping operations and understand how NumPy handles array memory','[]','[]','[]','2025-11-27 08:48:49','2025-11-27 08:48:49');
INSERT INTO "lessons" VALUES(30,'array-reshape-index','numpy-array-essentials','numpy-fundamentals','numpy','array-reshape-index','lesson','30 minutes',4,'live','easy','Combined operations involving array reshaping and advanced indexing','Learn to combine reshaping with indexing for complex data manipulation tasks','[]','[]','[]','2025-11-27 08:48:55','2025-11-27 08:48:55');
INSERT INTO "lessons" VALUES(31,'aggregating','data-manipulation-techniques','numpy-fundamentals','numpy','aggregating','lesson','30 minutes',1,'live','easy','Learn statistical and mathematical aggregation methods','Master sum, mean, max, min and other aggregation functions','[]','[]','[]','2025-11-27 08:49:02','2025-11-27 08:49:02');
INSERT INTO "lessons" VALUES(32,'axis-argument','data-manipulation-techniques','numpy-fundamentals','numpy','axis-argument','lesson','30 minutes',2,'live','easy','Understanding axis parameter for multidimensional operations','Learn how to use the axis parameter to control operation direction in arrays','[]','[]','[]','2025-11-27 08:49:06','2025-11-27 08:49:06');
INSERT INTO "lessons" VALUES(33,'keepdims','data-manipulation-techniques','numpy-fundamentals','numpy','keepdims','lesson','25 minutes',3,'live','easy','Control output shape preservation with keepdims parameter','Learn how keepdims affects the shape of operation results','[]','[]','[]','2025-11-27 08:49:12','2025-11-27 08:49:12');
INSERT INTO "lessons" VALUES(34,'aggregating-broadcasting','data-manipulation-techniques','numpy-fundamentals','numpy','aggregating-broadcasting','lesson','35 minutes',4,'live','medium','Combine aggregation operations with broadcasting techniques','Advanced techniques combining aggregation with broadcasting for complex operations','[]','[]','[]','2025-11-27 08:49:17','2025-11-27 08:49:17');
INSERT INTO "lessons" VALUES(35,'cumulative-sum','numerical-computations','numpy-fundamentals','numpy','cumulative-sum','lesson','25 minutes',1,'live','easy','Learn cumulative operations like cumsum and cumprod','Master cumulative mathematical operations for running calculations','[]','[]','[]','2025-11-27 08:49:25','2025-11-27 08:49:25');
INSERT INTO "lessons" VALUES(36,'vectorization','numerical-computations','numpy-fundamentals','numpy','vectorization','lesson','35 minutes',2,'live','medium','Optimize performance using vectorized operations','Learn to write efficient NumPy code using vectorization techniques','[]','[]','[]','2025-11-27 08:49:30','2025-11-27 08:49:30');
INSERT INTO "lessons" VALUES(37,'broadcasting','numerical-computations','numpy-fundamentals','numpy','broadcasting','lesson','40 minutes',3,'live','medium','Master NumPy broadcasting rules for efficient array operations','Understand and apply broadcasting rules for element-wise operations between arrays of different shapes','[]','[]','[]','2025-11-27 08:49:35','2025-11-27 08:49:35');
INSERT INTO "lessons" VALUES(38,'broadcasting-aggregating','numerical-computations','numpy-fundamentals','numpy','broadcasting-aggregating','lesson','40 minutes',4,'live','medium','Advanced combination of broadcasting with aggregation operations','Master complex operations that combine broadcasting and aggregation for real-world data processing','[]','[]','[]','2025-11-27 08:49:50','2025-11-27 08:49:50');
INSERT INTO "lessons" VALUES(39,'programs-and-blocks','understand-triton-programming-model','triton-programming','triton','programs-and-blocks','lesson','30 minutes',1,'live','easy','Programs and Blocks','Programs and Blocks are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 18:36:22','2025-12-04 18:36:22');
INSERT INTO "lessons" VALUES(40,'memory-operations','understand-triton-programming-model','triton-programming','triton','memory-operations','lesson','30 minutes',2,'live','easy','Memory Operations','Memory Operations are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 18:36:29','2025-12-04 18:36:29');
INSERT INTO "lessons" VALUES(41,'memory-hierarchy','understand-triton-programming-model','triton-programming','triton','memory-hierarchy','lesson','30 minutes',3,'live','easy','Memory Hierarchy','Memory Hierarchy are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 18:36:35','2025-12-04 18:36:35');
INSERT INTO "lessons" VALUES(43,'vector-addition','write-triton-kernels-for-ml-operations','triton-programming','triton','vector-addition','lesson','30 minutes',2,'live','easy','Vector Addition','Vector Addition are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 18:59:20','2025-12-04 18:59:20');
INSERT INTO "lessons" VALUES(44,'element-wise-operations','write-triton-kernels-for-ml-operations','triton-programming','triton','element-wise-operations','lesson','30 minutes',3,'live','easy','Element-wise Operations','Element-wise Operations are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 18:59:28','2025-12-04 18:59:28');
INSERT INTO "lessons" VALUES(45,'relu-activation','write-triton-kernels-for-ml-operations','triton-programming','triton','relu-activation','lesson','30 minutes',4,'live','easy','ReLU Activation Kernel','ReLU Activation Kernel are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 18:59:40','2025-12-04 18:59:40');
INSERT INTO "lessons" VALUES(46,'sigmoid-tanh-activations','write-triton-kernels-for-ml-operations','triton-programming','triton','sigmoid-tanh-activations','lesson','30 minutes',5,'live','easy','Sigmoid and Tanh Activations','Sigmoid and Tanh Activations are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 19:00:00','2025-12-04 19:00:00');
INSERT INTO "lessons" VALUES(47,'vector-reduction','write-triton-kernels-for-ml-operations','triton-programming','triton','vector-reduction','lesson','30 minutes',6,'live','easy','Vector Reduction Operations','Vector Reduction Operations are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 19:00:13','2025-12-04 19:00:13');
INSERT INTO "lessons" VALUES(48,'softmax-implementation','write-triton-kernels-for-ml-operations','triton-programming','triton','softmax-implementation','lesson','30 minutes',7,'live','easy','Softmax Implementation','Softmax Implementation are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 19:00:20','2025-12-04 19:00:20');
INSERT INTO "lessons" VALUES(49,'matrix-transpose','write-triton-kernels-for-ml-operations','triton-programming','triton','matrix-transpose','lesson','30 minutes',8,'live','easy','Matrix Transpose','Matrix Transpose are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 19:00:31','2025-12-04 19:00:31');
INSERT INTO "lessons" VALUES(50,'gemv','write-triton-kernels-for-ml-operations','triton-programming','triton','gemv','lesson','30 minutes',9,'live','easy','GEMV','GEMV are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-04 19:00:37','2025-12-04 19:00:37');
INSERT INTO "lessons" VALUES(51,'gemm','write-triton-kernels-for-ml-operations','triton-programming','triton','gemm','lesson','30 minutes',10,'live','easy','GEMM','GEMM are the basic building blocks of Triton programming model','[]','[]','[]','2025-12-05 03:46:42','2025-12-05 03:46:42');
INSERT INTO "lessons" VALUES(53,'introduction','pytorch-foundations','introduction-to-deep-learning-with-pytorch','pytorch','introduction','lesson','30 minutes',1,'live','easy','Introduction to PyTorch','This lesson introduces the fundamentals of PyTorch','[]','[]','[]','2025-12-14 14:29:43','2025-12-14 14:29:43');
INSERT INTO "lessons" VALUES(54,'first-neural-network','pytorch-foundations','introduction-to-deep-learning-with-pytorch','pytorch','first-neural-network','lesson','30 minutes',2,'live','easy','Building Your First Neural Network','Learn how to build your first neural network with PyTorch','[]','[]','[]','2025-12-14 14:30:50','2025-12-14 14:30:50');
INSERT INTO "lessons" VALUES(55,'hidden-layers','network-architecture','introduction-to-deep-learning-with-pytorch','pytorch','hidden-layers','lesson','30 minutes',1,'live','easy','Neural Networks with Hidden Layers','Understanding hidden layers in neural networks','[]','[]','[]','2025-12-14 14:31:09','2025-12-14 14:31:09');
INSERT INTO "lessons" VALUES(56,'sigmoid-softmax','network-architecture','introduction-to-deep-learning-with-pytorch','pytorch','sigmoid-softmax','lesson','30 minutes',2,'live','easy','Activation Functions: Sigmoid and Softmax','Learn about sigmoid and softmax activation functions','[]','[]','[]','2025-12-14 14:31:17','2025-12-14 14:31:17');
INSERT INTO "lessons" VALUES(57,'relu','network-architecture','introduction-to-deep-learning-with-pytorch','pytorch','relu','lesson','30 minutes',3,'live','easy','ReLU Activation Function','Understanding the ReLU activation function','[]','[]','[]','2025-12-14 14:31:24','2025-12-14 14:31:24');
INSERT INTO "lessons" VALUES(58,'forward-pass','forward-propagation','introduction-to-deep-learning-with-pytorch','pytorch','forward-pass','lesson','30 minutes',1,'live','easy','Running a Forward Pass','Learn how to run a forward pass through a neural network','[]','[]','[]','2025-12-14 14:31:39','2025-12-14 14:31:39');
INSERT INTO "lessons" VALUES(59,'encoding-loss','forward-propagation','introduction-to-deep-learning-with-pytorch','pytorch','encoding-loss','lesson','30 minutes',2,'live','easy','Encoding and Loss Functions','Understanding encoding and loss functions in neural networks','[]','[]','[]','2025-12-14 14:31:45','2025-12-14 14:31:45');
INSERT INTO "lessons" VALUES(60,'backpropagation','training-pipeline','introduction-to-deep-learning-with-pytorch','pytorch','backpropagation','lesson','30 minutes',1,'live','medium','Backpropagation and Gradient Descent','Understanding backpropagation and gradient descent','[]','[]','[]','2025-12-14 14:31:57','2025-12-14 14:31:57');
INSERT INTO "lessons" VALUES(61,'data-loading','training-pipeline','introduction-to-deep-learning-with-pytorch','pytorch','data-loading','lesson','30 minutes',2,'live','easy','TensorDataset and DataLoader','Working with TensorDataset and DataLoader in PyTorch','[]','[]','[]','2025-12-14 14:32:06','2025-12-14 14:32:06');
INSERT INTO "lessons" VALUES(62,'training-loop','training-pipeline','introduction-to-deep-learning-with-pytorch','pytorch','training-loop','lesson','30 minutes',3,'live','medium','The Training Loop','Implementing a complete training loop','[]','[]','[]','2025-12-14 14:32:12','2025-12-14 14:32:12');
INSERT INTO "lessons" VALUES(63,'parallel-computing','foundations','cuda-programming','cuda','parallel-computing','lesson','60 minutes',1,'live','easy','Introduction to Parallel Computing Concepts','Learn the fundamentals of parallel computing and its importance in CUDA programming','[]','[]','[]','2025-12-20 18:11:00','2025-12-20 18:11:00');
INSERT INTO "lessons" VALUES(64,'cuda-cores-sms-simt-firstprogram','foundations','cuda-programming','cuda','cuda-cores-sms-simt-firstprogram','lesson','60 minutes',2,'live','easy','CUDA Cores, Streaming Multiprocessors, SIMT, and First Program','Understanding CUDA hardware architecture and writing your first CUDA program','[]','[]','[]','2025-12-20 18:11:43','2025-12-20 18:11:43');
INSERT INTO "lessons" VALUES(65,'kernels','cuda-programming-model','cuda-programming','cuda','kernels','lesson','45 minutes',1,'live','easy','Understanding CUDA Kernels','Learn how to write and launch CUDA kernels','[]','[]','[]','2025-12-20 18:13:14','2025-12-20 18:13:14');
INSERT INTO "lessons" VALUES(66,'thread-hierarchy','cuda-programming-model','cuda-programming','cuda','thread-hierarchy','lesson','60 minutes',2,'live','easy','Thread Hierarchy in CUDA','Understanding grids, blocks, and threads in CUDA','[]','[]','[]','2025-12-20 18:14:04','2025-12-20 18:14:04');
INSERT INTO "lessons" VALUES(67,'thread-indexing','cuda-programming-model','cuda-programming','cuda','thread-indexing','lesson','45 minutes',3,'live','easy','Thread Indexing in CUDA','Master thread indexing for efficient parallel computation','[]','[]','[]','2025-12-20 18:14:33','2025-12-20 18:14:33');
INSERT INTO "lessons" VALUES(68,'warp-fundamentals','cuda-programming-model','cuda-programming','cuda','warp-fundamentals','lesson','60 minutes',4,'live','easy','Understanding Warps in CUDA','Learn about warp execution and divergence','[]','[]','[]','2025-12-20 18:15:21','2025-12-20 18:15:21');
INSERT INTO "lessons" VALUES(69,'cuda-thread-organization','cuda-programming-model','cuda-programming','cuda','cuda-thread-organization','lesson','75 minutes',5,'live','easy','CUDA Thread Organization','Comprehensive guide to organizing threads in CUDA','[]','[]','[]','2025-12-20 18:15:50','2025-12-20 18:15:50');
INSERT INTO "lessons" VALUES(70,'occupancy-basics','cuda-programming-model','cuda-programming','cuda','occupancy-basics','lesson','45 minutes',6,'live','easy','Occupancy Basics','Understanding and optimizing GPU occupancy','[]','[]','[]','2025-12-20 18:16:09','2025-12-20 18:16:09');
INSERT INTO "lessons" VALUES(71,'global-memory','memory-hierarchy','cuda-programming','cuda','global-memory','lesson','60 minutes',1,'live','easy','Global Memory in CUDA','Understanding global memory allocation and access patterns','[]','[]','[]','2025-12-20 18:16:48','2025-12-20 18:16:48');
INSERT INTO "lessons" VALUES(72,'shared-memory','memory-hierarchy','cuda-programming','cuda','shared-memory','lesson','75 minutes',2,'live','easy','Shared Memory in CUDA','Using shared memory for performance optimization','[]','[]','[]','2025-12-20 18:17:35','2025-12-20 18:17:35');
INSERT INTO "lessons" VALUES(73,'registers','memory-hierarchy','cuda-programming','cuda','registers','lesson','45 minutes',3,'live','easy','Registers and Local Memory','Understanding register usage and local memory','[]','[]','[]','2025-12-20 18:17:58','2025-12-20 18:17:58');
INSERT INTO "lessons" VALUES(74,'constant-memory','memory-hierarchy','cuda-programming','cuda','constant-memory','lesson','45 minutes',4,'live','easy','Constant Memory','Using constant memory for read-only data','[]','[]','[]','2025-12-20 18:18:28','2025-12-20 18:18:28');
INSERT INTO "lessons" VALUES(75,'memory-bandwidth-and-latency','memory-hierarchy','cuda-programming','cuda','memory-bandwidth-and-latency','lesson','60 minutes',5,'live','easy','Memory Bandwidth and Latency','Understanding memory performance characteristics','[]','[]','[]','2025-12-20 18:18:52','2025-12-20 18:18:52');
INSERT INTO "lessons" VALUES(76,'host-device-memory-transfer','memory-hierarchy','cuda-programming','cuda','host-device-memory-transfer','lesson','60 minutes',6,'live','easy','Host-Device Memory Transfer','Optimizing data transfers between CPU and GPU','[]','[]','[]','2025-12-20 18:19:12','2025-12-20 18:19:12');
INSERT INTO "lessons" VALUES(77,'memory-coalescing-and-alignment','memory-optimization','cuda-programming','cuda','memory-coalescing-and-alignment','lesson','60 minutes',1,'live','easy','Memory Coalescing and Alignment','Achieving coalesced memory access patterns','[]','[]','[]','2025-12-20 18:20:12','2025-12-20 18:20:12');
INSERT INTO "lessons" VALUES(78,'access-patterns-and-stride-optimization','memory-optimization','cuda-programming','cuda','access-patterns-and-stride-optimization','lesson','60 minutes',2,'live','easy','Access Patterns and Stride Optimization','Optimizing memory access patterns and strides','[]','[]','[]','2025-12-20 18:20:32','2025-12-20 18:20:32');
INSERT INTO "lessons" VALUES(79,'shared-memory-bank-conflicts','memory-optimization','cuda-programming','cuda','shared-memory-bank-conflicts','lesson','60 minutes',3,'live','easy','Bank Conflicts in Shared Memory','Understanding and avoiding shared memory bank conflicts','[]','[]','[]','2025-12-20 18:20:53','2025-12-20 18:20:53');
INSERT INTO "lessons" VALUES(80,'vector-addition','basic-cuda-kernels','cuda-programming','cuda','vector-addition','lesson','90 minutes',1,'live','easy','Vector Addition in CUDA','Implementing the fundamental vector addition kernel','[]','[]','[]','2025-12-20 18:21:26','2025-12-20 18:21:26');
INSERT INTO "lessons" VALUES(81,'element-wise-operations','basic-cuda-kernels','cuda-programming','cuda','element-wise-operations','lesson','60 minutes',2,'live','easy','Element-wise Operations','Implementing various element-wise operations','[]','[]','[]','2025-12-20 18:21:47','2025-12-20 18:21:47');
CREATE TABLE roadmap_labs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lab_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  roadmap_id TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  has_tinygrad BOOLEAN DEFAULT 0,
  has_pytorch BOOLEAN DEFAULT 0,
  requires_gpu BOOLEAN DEFAULT 0,
  problem_type TEXT DEFAULT 'free' CHECK (problem_type IN ('free', 'premium')),
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'coming_soon', 'archived')),
  estimated_time TEXT,
  description TEXT,
  instructions TEXT,
  starter_code TEXT,
  solution TEXT,
  hints TEXT DEFAULT '[]',
  resources TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(roadmap_id, module_id, chapter_id, lesson_id, lab_id)
);
INSERT INTO "roadmap_labs" VALUES(5,'lab-10-tensor-operations-1763638806663','arithmetic-reductions','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_10_Tensor_Operations','Tensor Operations: Arithmetic and Reductions','medium',0,1,0,'free','live','60 minutes','Tensor Operations: Arithmetic and Reductions','Complete Lab 10: Tensor Operations: Arithmetic and Reductions',replace('# Lab 10: Tensor Operations: Arithmetic and Reductions\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 10: Tensor Operations: Arithmetic and Reductions','[]','[]','2025-11-20 11:40:06','2025-11-20 11:40:06');
INSERT INTO "roadmap_labs" VALUES(6,'lab-11-matrix-operations-1763638823958','matrix-operations','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_11_Matrix_Operations','Matrix Operations','medium',0,1,0,'free','live','60 minutes','Matrix Operations','Complete Lab 11: Matrix Operations',replace('# Lab 11: Matrix Operations\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 11: Matrix Operations','[]','[]','2025-11-20 11:40:24','2025-11-20 11:40:24');
INSERT INTO "roadmap_labs" VALUES(7,'lab-12-activation-functions-1763638829539','activation-functions-ops','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_12_Activation_Functions','Activation Functions','medium',0,1,0,'free','live','45 minutes','Activation Functions','Complete Lab 12: Activation Functions',replace('# Lab 12: Activation Functions\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 12: Activation Functions','[]','[]','2025-11-20 11:40:29','2025-11-20 11:40:29');
INSERT INTO "roadmap_labs" VALUES(8,'lab-13-shape-operations-1763638835670','shape-operations','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_13_Shape_Operations','Shape Operations','medium',0,1,0,'free','live','45 minutes','Shape Operations','Complete Lab 13: Shape Operations',replace('# Lab 13: Shape Operations\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 13: Shape Operations','[]','[]','2025-11-20 11:40:35','2025-11-20 11:40:35');
INSERT INTO "roadmap_labs" VALUES(9,'lab-14-complete-tensor-api-1763638840743','complete-tensor-api','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_14_Complete_Tensor_API','Complete Tensor API','hard',0,1,0,'free','live','90 minutes','Complete Tensor API','Complete Lab 14: Complete Tensor API',replace('# Lab 14: Complete Tensor API\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 14: Complete Tensor API','[]','[]','2025-11-20 11:40:40','2025-11-20 11:40:40');
INSERT INTO "roadmap_labs" VALUES(10,'lab-15-the-module-system-1763638878744','module-system','building-networks','building-pytorch-from-scratch','pytorch','Lab_15_The_Module_System','The Module System','medium',0,1,0,'free','live','60 minutes','The Module System','Complete Lab 15: The Module System',replace('# Lab 15: The Module System\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 15: The Module System','[]','[]','2025-11-20 11:41:18','2025-11-20 11:41:18');
INSERT INTO "roadmap_labs" VALUES(11,'lab-15-the-module-system-1763639163267','module-system','building-networks','building-pytorch-from-scratch','pytorch','Lab_15_The_Module_System','The Module System','medium',0,1,0,'free','live','60 minutes','The Module System','Complete Lab 15: The Module System',replace('# Lab 15: The Module System\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 15: The Module System','[]','[]','2025-11-20 11:46:03','2025-11-20 11:46:03');
INSERT INTO "roadmap_labs" VALUES(12,'lab-16-building-your-first-neural-network-1763639173023','first-neural-network','building-networks','building-pytorch-from-scratch','pytorch','Lab_16_Building_Your_First_Neural_Network','Building Your First Neural Network','medium',0,1,0,'free','live','75 minutes','Building Your First Neural Network','Complete Lab 16: Building Your First Neural Network',replace('# Lab 16: Building Your First Neural Network\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 16: Building Your First Neural Network','[]','[]','2025-11-20 11:46:13','2025-11-20 11:46:13');
INSERT INTO "roadmap_labs" VALUES(13,'lab-17-softmax-1763639177317','softmax','building-networks','building-pytorch-from-scratch','pytorch','Lab_17_Softmax','Softmax','medium',0,1,0,'free','live','45 minutes','Softmax','Complete Lab 17: Softmax',replace('# Lab 17: Softmax\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 17: Softmax','[]','[]','2025-11-20 11:46:17','2025-11-20 11:46:17');
INSERT INTO "roadmap_labs" VALUES(14,'lab-18-loss-functions-1763639182505','loss-functions','training','building-pytorch-from-scratch','pytorch','Lab_18_Loss_Functions','Loss Functions','medium',0,1,0,'free','live','60 minutes','Loss Functions','Complete Lab 18: Loss Functions',replace('# Lab 18: Loss Functions\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 18: Loss Functions','[]','[]','2025-11-20 11:46:22','2025-11-20 11:46:22');
INSERT INTO "roadmap_labs" VALUES(15,'lab-19-optimizer-sgd-1763639186340','sgd-optimizer','training','building-pytorch-from-scratch','pytorch','Lab_19_Optimizer_SGD','SGD Optimizer','medium',0,1,0,'free','live','60 minutes','SGD Optimizer','Complete Lab 19: SGD Optimizer',replace('# Lab 19: SGD Optimizer\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 19: SGD Optimizer','[]','[]','2025-11-20 11:46:26','2025-11-20 11:46:26');
INSERT INTO "roadmap_labs" VALUES(16,'lab-1-mathematical-foundations-1763639194912','mathematical-operations','foundations','building-pytorch-from-scratch','pytorch','Lab_1_Mathematical_Foundations','Basic Mathematical Operations','easy',0,0,0,'free','live','30 minutes','Basic Mathematical Operations','Complete Lab 1: Basic Mathematical Operations',replace('# Lab 1: Basic Mathematical Operations\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 1: Basic Mathematical Operations','[]','[]','2025-11-20 11:46:35','2025-11-20 11:46:35');
INSERT INTO "roadmap_labs" VALUES(17,'lab-20-conv1d-fundamentals-1763639200225','conv1d-fundamentals','convolutional-layers','building-pytorch-from-scratch','pytorch','Lab_20_Conv1D_Fundamentals','Conv1D Fundamentals','hard',0,1,0,'free','live','90 minutes','Conv1D Fundamentals','Complete Lab 20: Conv1D Fundamentals',replace('# Lab 20: Conv1D Fundamentals\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 20: Conv1D Fundamentals','[]','[]','2025-11-20 11:46:40','2025-11-20 11:46:40');
INSERT INTO "roadmap_labs" VALUES(18,'lab-21-conv2d-internals-1763639203958','conv2d-internals','convolutional-layers','building-pytorch-from-scratch','pytorch','Lab_21_Conv2D_Internals','Conv2D Internals','hard',0,1,0,'free','live','90 minutes','Conv2D Internals','Complete Lab 21: Conv2D Internals',replace('# Lab 21: Conv2D Internals\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 21: Conv2D Internals','[]','[]','2025-11-20 11:46:44','2025-11-20 11:46:44');
INSERT INTO "roadmap_labs" VALUES(19,'lab-22-pooling-operations-1763639226458','pooling-operations','convolutional-layers','building-pytorch-from-scratch','pytorch','Lab_22_Pooling_Operations','Pooling Operations','hard',0,1,0,'free','live','75 minutes','Pooling Operations','Complete Lab 22: Pooling Operations',replace('# Lab 22: Pooling Operations\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 22: Pooling Operations','[]','[]','2025-11-20 11:47:06','2025-11-20 11:47:06');
INSERT INTO "roadmap_labs" VALUES(20,'lab-23-custom-autograd-functions-1763639233197','custom-autograd-functions','automatic-differentiation','building-pytorch-from-scratch','pytorch','Lab_23_Custom_Autograd_Functions','Custom Autograd Functions','hard',0,1,0,'free','live','60 minutes','Custom Autograd Functions','Complete Lab 23: Custom Autograd Functions',replace('# Lab 23: Custom Autograd Functions\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 23: Custom Autograd Functions','[]','[]','2025-11-20 11:47:13','2025-11-20 11:47:13');
INSERT INTO "roadmap_labs" VALUES(21,'lab-24-training-loop-1763639237484','training-loop','training','building-pytorch-from-scratch','pytorch','Lab_24_Training_Loop','Neural Network Training Loop','hard',0,1,0,'free','live','60 minutes','Neural Network Training Loop','Complete Lab 24: Neural Network Training Loop',replace('# Lab 24: Neural Network Training Loop\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 24: Neural Network Training Loop','[]','[]','2025-11-20 11:47:17','2025-11-20 11:47:17');
INSERT INTO "roadmap_labs" VALUES(22,'lab-2-activation-function-1763639242344','activation-functions','foundations','building-pytorch-from-scratch','pytorch','Lab_2_Activation_Function','Activation Functions','easy',0,0,0,'free','live','30 minutes','Activation Functions','Complete Lab 2: Activation Functions',replace('# Lab 2: Activation Functions\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 2: Activation Functions','[]','[]','2025-11-20 11:47:22','2025-11-20 11:47:22');
INSERT INTO "roadmap_labs" VALUES(23,'lab-3-relu-activation-1763639247538','relu-activation','foundations','building-pytorch-from-scratch','pytorch','Lab_3_ReLU_Activation','ReLU Activation Function','easy',0,0,0,'free','live','30 minutes','ReLU Activation Function','Complete Lab 3: ReLU Activation Function',replace('# Lab 3: ReLU Activation Function\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 3: ReLU Activation Function','[]','[]','2025-11-20 11:47:27','2025-11-20 11:47:27');
INSERT INTO "roadmap_labs" VALUES(24,'lab-4-sigmoid-function-1763639252054','sigmoid-activation','foundations','building-pytorch-from-scratch','pytorch','Lab_4_Sigmoid_Function','Sigmoid Activation Function','easy',0,0,0,'free','live','30 minutes','Sigmoid Activation Function','Complete Lab 4: Sigmoid Activation Function',replace('# Lab 4: Sigmoid Activation Function\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 4: Sigmoid Activation Function','[]','[]','2025-11-20 11:47:32','2025-11-20 11:47:32');
INSERT INTO "roadmap_labs" VALUES(25,'lab-5-tanh-function-1763639255963','tanh-activation','foundations','building-pytorch-from-scratch','pytorch','Lab_5_Tanh_Function','Tanh Activation Function','easy',0,0,0,'free','live','30 minutes','Tanh Activation Function','Complete Lab 5: Tanh Activation Function',replace('# Lab 5: Tanh Activation Function\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 5: Tanh Activation Function','[]','[]','2025-11-20 11:47:36','2025-11-20 11:47:36');
INSERT INTO "roadmap_labs" VALUES(26,'lab-6-scalar-autodiff-1763639260852','scalar-autodiff','automatic-differentiation','building-pytorch-from-scratch','pytorch','Lab_6_Scalar_Autodiff','Scalar Autodiff','medium',0,0,0,'free','live','45 minutes','Scalar Autodiff','Complete Lab 6: Scalar Autodiff',replace('# Lab 6: Scalar Autodiff\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 6: Scalar Autodiff','[]','[]','2025-11-20 11:47:40','2025-11-20 11:47:40');
INSERT INTO "roadmap_labs" VALUES(27,'lab-7-build-the-torch-autograd-api-1763639265961','autograd-api','automatic-differentiation','building-pytorch-from-scratch','pytorch','Lab_7_Build_The_Torch-Autograd_API','Build the torch.autograd API','medium',0,1,0,'free','live','60 minutes','Build the torch.autograd API','Complete Lab 7: Build the torch.autograd API',replace('# Lab 7: Build the torch.autograd API\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 7: Build the torch.autograd API','[]','[]','2025-11-20 11:47:46','2025-11-20 11:47:46');
INSERT INTO "roadmap_labs" VALUES(28,'lab-8-tensor-storage-internals-1763639269771','storage-internals','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_8_Tensor_Storage_Internals','Tensor Storage Internals','medium',0,1,0,'free','live','45 minutes','Tensor Storage Internals','Complete Lab 8: Tensor Storage Internals',replace('# Lab 8: Tensor Storage Internals\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 8: Tensor Storage Internals','[]','[]','2025-11-20 11:47:49','2025-11-20 11:47:49');
INSERT INTO "roadmap_labs" VALUES(29,'lab-9-broadcasting-1763639274001','broadcasting','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_9_Broadcasting','Broadcasting','medium',0,1,0,'free','live','45 minutes','Broadcasting','Complete Lab 9: Broadcasting',replace('# Lab 9: Broadcasting\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 9: Broadcasting','[]','[]','2025-11-20 11:47:54','2025-11-20 11:47:54');
INSERT INTO "roadmap_labs" VALUES(30,'lab-10-tensor-operations-1763639282625','arithmetic-reductions','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_10_Tensor_Operations','Tensor Operations: Arithmetic and Reductions','medium',0,1,0,'free','live','60 minutes','Tensor Operations: Arithmetic and Reductions','Complete Lab 10: Tensor Operations: Arithmetic and Reductions',replace('# Lab 10: Tensor Operations: Arithmetic and Reductions\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 10: Tensor Operations: Arithmetic and Reductions','[]','[]','2025-11-20 11:48:02','2025-11-20 11:48:02');
INSERT INTO "roadmap_labs" VALUES(31,'lab-10-tensor-operations-1763639306349','arithmetic-reductions','tensor-operations','building-pytorch-from-scratch','pytorch','Lab_10_Tensor_Operations','Tensor Operations: Arithmetic and Reductions','medium',0,1,0,'free','live','60 minutes','Tensor Operations: Arithmetic and Reductions','Complete Lab 10: Tensor Operations: Arithmetic and Reductions',replace('# Lab 10: Tensor Operations: Arithmetic and Reductions\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 10: Tensor Operations: Arithmetic and Reductions','[]','[]','2025-11-20 11:48:26','2025-11-20 11:48:26');
INSERT INTO "roadmap_labs" VALUES(37,'lab-1-mathematical-foundations-1763911957197','mathematical-foundations','foundations','building-pytorch-from-scratch','pytorch','Lab_1_Mathematical_Foundations','Basic Mathematical Operations','easy',0,0,0,'free','live','30 minutes','Basic Mathematical Operations','Complete Lab 1: Basic Mathematical Operations',replace('# Lab 1: Basic Mathematical Operations\n# Follow the instructions to complete this lab','\n',char(10)),'# Solution for Lab 1: Basic Mathematical Operations','[]','[]','2025-11-23 15:32:37','2025-11-23 15:32:37');
INSERT INTO "roadmap_labs" VALUES(64,'lab-01-introducing-arrays-1764403057030','introduction','numpy-array-essentials','numpy-fundamentals','numpy','Lab_01_introducing-arrays','Introducing Arrays','easy',0,0,0,'free','live','20 minutes','Introduction to NumPy arrays and basic operations','Learn to create and manipulate basic NumPy arrays','# Introduction to NumPy arrays starter code','# NumPy arrays introduction solution','[]','[]','2025-11-29 07:57:37','2025-11-29 07:57:37');
INSERT INTO "roadmap_labs" VALUES(66,'lab-03-numpy-data-types-1764403070114','reshaping','numpy-array-essentials','numpy-fundamentals','numpy','Lab_03_numpy-data-types','NumPy Data Types','easy',0,0,0,'free','live','25 minutes','Working with different NumPy data types','Learn to specify and convert array data types','# NumPy data types starter code','# NumPy data types solution','[]','[]','2025-11-29 07:57:50','2025-11-29 07:57:50');
INSERT INTO "roadmap_labs" VALUES(67,'lab-04-indexing-and-slicing-arrays-1764403075071','aggregating','data-manipulation-techniques','numpy-fundamentals','numpy','Lab_04_indexing-and-slicing-arrays','Indexing and Slicing Arrays','easy',0,0,0,'free','live','30 minutes','Master array indexing and slicing techniques','Practice various indexing and slicing operations','# Array indexing and slicing starter code','# Array indexing and slicing solution','[]','[]','2025-11-29 07:57:55','2025-11-29 07:57:55');
INSERT INTO "roadmap_labs" VALUES(68,'lab-05-filtering-arrays-1764403080617','axis-argument','data-manipulation-techniques','numpy-fundamentals','numpy','Lab_05_filtering-arrays','Filtering Arrays','easy',0,0,0,'free','live','30 minutes','Learn to filter arrays using boolean indexing','Apply boolean masks to filter array elements','# Array filtering starter code','# Array filtering solution','[]','[]','2025-11-29 07:58:00','2025-11-29 07:58:00');
INSERT INTO "roadmap_labs" VALUES(69,'lab-06-adding-and-removing-data-1764403085723','keepdims','data-manipulation-techniques','numpy-fundamentals','numpy','Lab_06_adding-and-removing-data','Adding and Removing Data','easy',0,0,0,'free','live','25 minutes','Learn to add and remove array elements','Practice append, insert, delete operations','# Adding and removing data starter code','# Adding and removing data solution','[]','[]','2025-11-29 07:58:05','2025-11-29 07:58:05');
INSERT INTO "roadmap_labs" VALUES(70,'lab-07-summarizing-data-1764403090651','cumulative-sum','numerical-computations','numpy-fundamentals','numpy','Lab_07_summarizing-data','Summarizing Data','easy',0,0,0,'free','live','25 minutes','Learn statistical summary operations','Calculate mean, median, std, and other statistics','# Data summarizing starter code','# Data summarizing solution','[]','[]','2025-11-29 07:58:10','2025-11-29 07:58:10');
INSERT INTO "roadmap_labs" VALUES(71,'lab-08-vectorized-operations-1764403095767','vectorization','numerical-computations','numpy-fundamentals','numpy','Lab_08_vectorized-operations','Vectorized Operations','medium',0,0,0,'free','live','35 minutes','Optimize performance using vectorized operations','Apply vectorization for efficient computations','# Vectorized operations starter code','# Vectorized operations solution','[]','[]','2025-11-29 07:58:15','2025-11-29 07:58:15');
INSERT INTO "roadmap_labs" VALUES(72,'lab-09-broadcasting-1764403101641','broadcasting','numerical-computations','numpy-fundamentals','numpy','Lab_09_broadcasting','Broadcasting','medium',0,0,0,'free','live','40 minutes','Master NumPy broadcasting for efficient operations','Apply broadcasting rules for array operations','# Broadcasting starter code','# Broadcasting solution','[]','[]','2025-11-29 07:58:21','2025-11-29 07:58:21');
INSERT INTO "roadmap_labs" VALUES(73,'lab-02-array-dimensionality-1764406114230','indexing-slicing','numpy-array-essentials','numpy-fundamentals','numpy','Lab_02_array-dimensionality','Array Dimensionality','easy',0,0,0,'free','live','25 minutes','Understanding array dimensions and shapes','Learn about 1D, 2D, and multidimensional arrays','# Array dimensionality starter code','# Array dimensionality solution','[]','[]','2025-11-29 08:48:34','2025-11-29 08:48:34');
INSERT INTO "roadmap_labs" VALUES(74,'lab-01-triton-programs-and-blocks-1764876600528','programs-and-blocks','understand-triton-programming-model','triton-programming','triton','Lab_01_Triton-Programs-and-Blocks','Programs and Blocks','easy',0,0,0,'free','live','30 minutes','Programs and Blocks are the basic building blocks of Triton programming model','Follow the steps to learn programs and blocks','# Code here','# Solution here','[]','[]','2025-12-04 19:30:00','2025-12-04 19:30:00');
INSERT INTO "roadmap_labs" VALUES(75,'lab-02-memory-operations-in-triton-1764876660308','memory-operations','understand-triton-programming-model','triton-programming','triton','Lab_02_Memory-Operations-in-Triton','Memory Operations in Triton','easy',0,0,0,'free','live','30 minutes','Memory Operations in Triton','Follow the steps to learn memory operations in Triton','# Code here','# Solution here','[]','[]','2025-12-04 19:31:00','2025-12-04 19:31:00');
INSERT INTO "roadmap_labs" VALUES(76,'lab-03-memory-hierarchy-and-coalescing-1764876698430','memory-hierarchy','understand-triton-programming-model','triton-programming','triton','Lab_03_Memory-Hierarchy-and-Coalescing','Memory Hierarchy and Coalescing','easy',0,0,0,'free','live','30 minutes','Memory Hierarchy and Coalescing','Follow the steps to learn memory hierarchy and coalescing in Triton','# Code here','# Solution here','[]','[]','2025-12-04 19:31:38','2025-12-04 19:31:38');
INSERT INTO "roadmap_labs" VALUES(86,'lab-04-vector-addition-in-triton-1764880334449','vector-addition','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_04_Vector-Addition-in-Triton','Vector Addition in Triton','easy',0,0,0,'free','live','30 minutes','Vector Addition in Triton','Follow the steps to learn vector addition in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:32:14','2025-12-04 20:32:14');
INSERT INTO "roadmap_labs" VALUES(87,'lab-05-element-wise-operations-1764880361390','element-wise-operations','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_05_Element-wise-Operations','Element-wise Operations in Triton','easy',0,0,0,'free','live','30 minutes','Element-wise Operations in Triton','Follow the steps to learn element-wise operations in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:32:41','2025-12-04 20:32:41');
INSERT INTO "roadmap_labs" VALUES(88,'lab-06-relu-activation-kernel-1764880383211','relu-activation','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_06_ReLU-Activation-Kernel','ReLU Activation Kernel in Triton','easy',0,0,0,'free','live','30 minutes','ReLU Activation Kernel in Triton','Follow the steps to learn relu activation kernel in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:33:03','2025-12-04 20:33:03');
INSERT INTO "roadmap_labs" VALUES(89,'lab-07-sigmoid-and-tanh-activations-1764880405538','sigmoid-tanh-activations','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_07_Sigmoid-and-Tanh-Activations','Sigmoid and Tanh Activations in Triton','easy',0,0,0,'free','live','30 minutes','Sigmoid and Tanh Activations in Triton','Follow the steps to learn sigmoid and tanh activations in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:33:25','2025-12-04 20:33:25');
INSERT INTO "roadmap_labs" VALUES(90,'lab-08-vector-reduction-operations-1764880425195','vector-reduction','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_08_Vector-Reduction-Operations','Vector Reduction Operations in Triton','easy',0,0,0,'free','live','30 minutes','Vector Reduction Operations in Triton','Follow the steps to learn vector reduction operations in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:33:45','2025-12-04 20:33:45');
INSERT INTO "roadmap_labs" VALUES(91,'lab-09-softmax-implementation-1764880440765','softmax-implementation','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_09_Softmax-Implementation','Softmax Implementation in Triton','easy',0,0,0,'free','live','30 minutes','Softmax Implementation in Triton','Follow the steps to learn softmax implementation in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:34:00','2025-12-04 20:34:00');
INSERT INTO "roadmap_labs" VALUES(92,'lab-10-matrix-transpose-1764880458276','matrix-transpose','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_10_Matrix-Transpose','Matrix Transpose in Triton','easy',0,0,0,'free','live','30 minutes','Matrix Transpose in Triton','Follow the steps to learn matrix transpose in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:34:18','2025-12-04 20:34:18');
INSERT INTO "roadmap_labs" VALUES(93,'lab-11-matrix-vector-multiplication-gemv-1764880487270','gemv','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_11_Matrix-Vector-Multiplication-GEMV','Matrix-Vector Multiplication (GEMV)','easy',0,0,0,'free','live','30 minutes','Matrix-Vector Multiplication (GEMV) in Triton','Follow the steps to learn matrix-vector multiplication (GEMV) in Triton','# Code here','# Solution here','[]','[]','2025-12-04 20:34:47','2025-12-04 20:34:47');
INSERT INTO "roadmap_labs" VALUES(96,'lab-12-matrix-multiplication-gemm-1764906417161','gemm','write-triton-kernels-for-ml-operations','triton-programming','triton','Lab_12_Matrix-Multiplication-GEMM','Matrix Multiplication (GEMM)','easy',0,0,0,'free','live','30 minutes','Matrix Multiplication (GEMM) in Triton','Follow the steps to learn matrix multiplication (GEMM) in Triton','# Code here','# Solution here','[]','[]','2025-12-05 03:46:57','2025-12-05 03:46:57');
INSERT INTO "roadmap_labs" VALUES(111,'lab-02-building-your-first-neural-network-1765725127295','first-neural-network','pytorch-foundations','introduction-to-deep-learning-with-pytorch','pytorch','Lab_02_building-your-first-neural-network','Building Your First Neural Network','easy',0,1,0,'free','live','30 min','Building Your First Neural Network','Build your first neural network with PyTorch','# Code here','# Solution here','[]','[]','2025-12-14 15:12:07','2025-12-14 15:12:07');
INSERT INTO "roadmap_labs" VALUES(122,'lab-01-introduction-to-pytorch-and-tensors-1766150950814','introduction','pytorch-foundations','introduction-to-deep-learning-with-pytorch','pytorch','Lab_01_introduction-to-pytorch-and-tensors','Introduction to PyTorch and Tensors','easy',0,1,0,'free','live','30 min','Introduction to PyTorch and Tensors','Follow the steps to learn PyTorch and Tensors','# Code here','# Solution here','[]','[]','2025-12-19 13:29:10','2025-12-19 13:29:10');
INSERT INTO "roadmap_labs" VALUES(123,'lab-03-neural-networks-with-hidden-layers-1766150960875','hidden-layers','network-architecture','introduction-to-deep-learning-with-pytorch','pytorch','Lab_03_neural-networks-with-hidden-layers','Neural Networks with Hidden Layers','easy',0,1,0,'free','live','30 min','Neural Networks with Hidden Layers','Learn to implement neural networks with hidden layers','# Code here','# Solution here','[]','[]','2025-12-19 13:29:21','2025-12-19 13:29:21');
INSERT INTO "roadmap_labs" VALUES(124,'lab-04-activation-functions-sigmoid-and-softmax-1766150971896','sigmoid-softmax','network-architecture','introduction-to-deep-learning-with-pytorch','pytorch','Lab_04_activation-functions-sigmoid-and-softmax','Activation Functions (Sigmoid and Softmax)','easy',0,1,0,'free','live','30 min','Activation Functions (Sigmoid and Softmax)','Implement sigmoid and softmax activation functions','# Code here','# Solution here','[]','[]','2025-12-19 13:29:34','2025-12-19 13:29:34');
INSERT INTO "roadmap_labs" VALUES(125,'lab-05-relu-activation-function-1766150980052','relu','network-architecture','introduction-to-deep-learning-with-pytorch','pytorch','Lab_05_relu-activation-function','ReLU Activation Function','easy',0,1,0,'free','live','30 min','ReLU Activation Function','Implement and understand ReLU activation function','# Code here','# Solution here','[]','[]','2025-12-19 13:29:40','2025-12-19 13:29:40');
INSERT INTO "roadmap_labs" VALUES(126,'lab-06-running-a-forward-pass-1766150984767','forward-pass','forward-propagation','introduction-to-deep-learning-with-pytorch','pytorch','Lab_06_running-a-forward-pass','Running a Forward Pass','easy',0,1,0,'free','live','30 min','Running a Forward Pass','Learn to implement forward propagation','# Code here','# Solution here','[]','[]','2025-12-19 13:29:44','2025-12-19 13:29:44');
INSERT INTO "roadmap_labs" VALUES(127,'lab-07-encoding-and-loss-functions-1766150992685','encoding-loss','forward-propagation','introduction-to-deep-learning-with-pytorch','pytorch','Lab_07_encoding-and-loss-functions','Encoding and Loss Functions','easy',0,1,0,'free','live','30 min','Encoding and Loss Functions','Implement encoding and loss functions','# Code here','# Solution here','[]','[]','2025-12-19 13:29:52','2025-12-19 13:29:52');
INSERT INTO "roadmap_labs" VALUES(128,'lab-08-backpropagation-and-gradient-descent-1766151007525','backpropagation','training-pipeline','introduction-to-deep-learning-with-pytorch','pytorch','Lab_08_backpropagation-and-gradient-descent','Backpropagation and Gradient Descent','medium',0,1,0,'free','live','30 min','Backpropagation and Gradient Descent','Implement backpropagation and gradient descent','# Code here','# Solution here','[]','[]','2025-12-19 13:30:07','2025-12-19 13:30:07');
INSERT INTO "roadmap_labs" VALUES(129,'lab-09-tensordataset-and-dataloader-1766151021352','data-loading','training-pipeline','introduction-to-deep-learning-with-pytorch','pytorch','Lab_09_tensordataset-and-dataloader','TensorDataset and DataLoader','easy',0,1,0,'free','live','30 min','TensorDataset and DataLoader','Work with TensorDataset and DataLoader','# Code here','# Solution here','[]','[]','2025-12-19 13:30:21','2025-12-19 13:30:21');
INSERT INTO "roadmap_labs" VALUES(130,'lab-10-the-training-loop-1766151026518','training-loop','training-pipeline','introduction-to-deep-learning-with-pytorch','pytorch','Lab_10_the-training-loop','The Training Loop','medium',0,1,0,'free','live','30 min','The Training Loop','Implement a complete training loop','# Code here','# Solution here','[]','[]','2025-12-19 13:30:26','2025-12-19 13:30:26');
INSERT INTO "roadmap_labs" VALUES(131,'lab-01-parallel-computing-1766254283330','parallel-computing','foundations','cuda-programming','cuda','Lab_01_Parallel-Computing','Parallel Computing Fundamentals','easy',0,0,0,'free','live','1 hour','Understanding parallel computing paradigms and their applications','Explore different types of parallelism including bit-level, instruction-level, and task-level parallelism','// Explore parallel computing concepts','// Solution demonstrating parallel computing principles','[]','[]','2025-12-20 18:11:23','2025-12-20 18:11:23');
INSERT INTO "roadmap_labs" VALUES(132,'lab-02-cuda-cores-sms-simt-firstprogram-1766254320121','cuda-cores-sms-simt-firstprogram','foundations','cuda-programming','cuda','Lab_02_CUDA-Cores-SMs-SIMT-FirstProgram','CUDA Cores, SMs, SIMT, FirstProgram','easy',0,0,1,'free','live','1 hour','Learn about CUDA cores, streaming multiprocessors, SIMT architecture and write your first CUDA program','Understand CUDA hardware architecture and implement a simple array sum program','// Write your first CUDA program','// Solution with complete CUDA array sum implementation','[]','[]','2025-12-20 18:12:00','2025-12-20 18:12:00');
INSERT INTO "roadmap_labs" VALUES(133,'lab-03-kernels-1766254406243','kernels','cuda-programming-model','cuda-programming','cuda','Lab_03_Kernels','CUDA Kernels','easy',0,0,1,'free','live','1 hour','Master CUDA kernel programming','Learn to write, configure, and launch CUDA kernels with different configurations','__global__ void kernel() { }','// Complete kernel implementation examples','[]','[]','2025-12-20 18:13:26','2025-12-20 18:13:26');
INSERT INTO "roadmap_labs" VALUES(134,'lab-04-thread-hierarchy-1766254460734','thread-hierarchy','cuda-programming-model','cuda-programming','cuda','Lab_04_Thread-Hierarchy','Thread Hierarchy','easy',0,0,1,'free','live','1 hour','Understanding CUDA thread hierarchy - grids, blocks, and threads','Work with 1D, 2D, and 3D thread configurations','// Implement different thread configurations','// Solutions for 1D, 2D, and 3D thread hierarchies','[]','[]','2025-12-20 18:14:20','2025-12-20 18:14:20');
INSERT INTO "roadmap_labs" VALUES(135,'lab-05-thread-indexing-1766254506127','thread-indexing','cuda-programming-model','cuda-programming','cuda','Lab_05_Thread-Indexing','Thread Indexing','easy',0,0,1,'free','live','1 hour','Master thread indexing techniques','Learn to calculate global thread indices in 1D and 2D configurations','// Calculate thread indices','// Complete thread indexing solutions','[]','[]','2025-12-20 18:15:06','2025-12-20 18:15:06');
INSERT INTO "roadmap_labs" VALUES(136,'lab-06-warp-fundamentals-1766254539671','warp-fundamentals','cuda-programming-model','cuda-programming','cuda','Lab_06_Warp-Fundamentals','Warp Fundamentals','easy',0,0,1,'free','live','1 hour','Understanding warp execution and avoiding divergence','Learn about warp execution model and implement divergent vs non-divergent code','// Explore warp behavior','// Solutions demonstrating warp optimization','[]','[]','2025-12-20 18:15:39','2025-12-20 18:15:39');
INSERT INTO "roadmap_labs" VALUES(137,'lab-07-cuda-thread-organization-1766254558812','cuda-thread-organization','cuda-programming-model','cuda-programming','cuda','Lab_07_CUDA-Thread-Organization','CUDA Thread Organization','easy',0,0,1,'free','live','1 hour','Comprehensive thread organization patterns','Implement various thread organization patterns for different use cases','// Implement thread organization','// Complete thread organization implementations','[]','[]','2025-12-20 18:15:58','2025-12-20 18:15:58');
INSERT INTO "roadmap_labs" VALUES(138,'lab-08-occupancy-basics-1766254585317','occupancy-basics','cuda-programming-model','cuda-programming','cuda','Lab_08_Occupancy-Basics','Occupancy Basics','easy',0,0,1,'free','live','1 hour','Understanding GPU occupancy and its impact on performance','Learn to calculate and optimize occupancy','// Explore occupancy concepts','// Occupancy optimization examples','[]','[]','2025-12-20 18:16:25','2025-12-20 18:16:25');
INSERT INTO "roadmap_labs" VALUES(139,'lab-09-global-memory-1766254644377','global-memory','memory-hierarchy','cuda-programming','cuda','Lab_09_Global-Memory','Global Memory','easy',0,0,1,'free','live','1 hour','Working with global memory in CUDA','Learn to allocate, access, and optimize global memory usage','// Global memory operations','// Complete global memory implementation','[]','[]','2025-12-20 18:17:24','2025-12-20 18:17:24');
INSERT INTO "roadmap_labs" VALUES(140,'lab-10-shared-memory-1766254666622','shared-memory','memory-hierarchy','cuda-programming','cuda','Lab_10_Shared-Memory','Shared Memory','easy',0,0,1,'free','live','1 hour','Optimizing with shared memory','Implement algorithms using shared memory for better performance','__shared__ float sharedMem[];','// Shared memory optimization examples','[]','[]','2025-12-20 18:17:46','2025-12-20 18:17:46');
INSERT INTO "roadmap_labs" VALUES(141,'lab-11-registers-1766254690998','registers','memory-hierarchy','cuda-programming','cuda','Lab_11_Registers','Registers','easy',0,0,1,'free','live','1 hour','Understanding register usage and optimization','Learn about register allocation and local memory','// Register usage examples','// Register optimization techniques','[]','[]','2025-12-20 18:18:11','2025-12-20 18:18:11');
INSERT INTO "roadmap_labs" VALUES(142,'lab-12-constant-memory-1766254719695','constant-memory','memory-hierarchy','cuda-programming','cuda','Lab_12_Constant-Memory','Constant Memory','easy',0,0,1,'free','live','1 hour','Working with constant memory','Learn to use constant memory for broadcast reads','__constant__ float constMem[SIZE];','// Constant memory usage examples','[]','[]','2025-12-20 18:18:39','2025-12-20 18:18:39');
INSERT INTO "roadmap_labs" VALUES(143,'lab-13-memory-bandwidth-and-latency-1766254742525','memory-bandwidth-and-latency','memory-hierarchy','cuda-programming','cuda','Lab_13_Memory-Bandwidth-and-Latency','Memory Bandwidth and Latency','easy',0,0,1,'free','live','1 hour','Measuring and optimizing memory performance','Learn to measure bandwidth and understand latency hiding','// Memory performance measurement','// Bandwidth and latency optimization','[]','[]','2025-12-20 18:19:02','2025-12-20 18:19:02');
INSERT INTO "roadmap_labs" VALUES(144,'lab-14-host-device-memory-transfer-1766254762771','host-device-memory-transfer','memory-hierarchy','cuda-programming','cuda','Lab_14_Host-Device-Memory-Transfer','Host-Device Memory Transfer','easy',0,0,1,'free','live','1 hour','Optimizing CPU-GPU data transfers','Learn about pinned memory and asynchronous transfers','cudaMemcpy(d_data, h_data, size, cudaMemcpyHostToDevice);','// Optimized memory transfer implementations','[]','[]','2025-12-20 18:19:22','2025-12-20 18:19:22');
INSERT INTO "roadmap_labs" VALUES(145,'lab-15-memory-coalescing-and-alignment-1766254822926','memory-coalescing-and-alignment','memory-optimization','cuda-programming','cuda','Lab_15_Memory-Coalescing-and-Alignment','Memory Coalescing and Alignment','easy',0,0,1,'free','live','1 hour','Implementing coalesced memory access patterns','Compare coalesced vs uncoalesced access patterns','// Implement coalesced access','// Coalesced memory access implementations','[]','[]','2025-12-20 18:20:23','2025-12-20 18:20:23');
INSERT INTO "roadmap_labs" VALUES(146,'lab-16-access-patterns-stride-optimization-1766254845016','access-patterns-and-stride-optimization','memory-optimization','cuda-programming','cuda','Lab_16_Access-Patterns-Stride-Optimization','Access Patterns and Stride Optimization','easy',0,0,1,'free','live','1 hour','Optimizing memory access strides','Implement and compare different stride patterns','// Implement strided access','// Optimized stride implementations','[]','[]','2025-12-20 18:20:45','2025-12-20 18:20:45');
INSERT INTO "roadmap_labs" VALUES(147,'lab-17-bank-conflicts-1766254862658','shared-memory-bank-conflicts','memory-optimization','cuda-programming','cuda','Lab_17_Bank-Conflicts','Bank Conflicts','easy',0,0,1,'free','live','1 hour','Identifying and resolving bank conflicts','Learn to detect and eliminate bank conflicts in shared memory','// Implement conflict-free access','// Bank conflict resolution techniques','[]','[]','2025-12-20 18:21:02','2025-12-20 18:21:02');
INSERT INTO "roadmap_labs" VALUES(148,'lab-18-vector-addition-1766254897296','vector-addition','basic-cuda-kernels','cuda-programming','cuda','Lab_18_Vector-Addition','Vector Addition','easy',0,0,1,'free','live','1 hour','Implement vector addition in CUDA','Create a complete vector addition implementation with error checking','__global__ void vectorAdd(float *a, float *b, float *c, int n) { }','// Complete vector addition implementation','[]','[]','2025-12-20 18:21:37','2025-12-20 18:21:37');
INSERT INTO "roadmap_labs" VALUES(149,'lab-19-element-wise-operation-1766254917184','element-wise-operations','basic-cuda-kernels','cuda-programming','cuda','Lab_19_Element-wise-operation','Element-wise Operations','easy',0,0,1,'free','live','45 minutes','Implement various element-wise operations','Create kernels for multiplication, division, and other operations','// Implement element-wise operations','// Complete element-wise operation kernels','[]','[]','2025-12-20 18:21:57','2025-12-20 18:21:57');
CREATE TABLE roadmap_problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  roadmap_id TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  has_tinygrad BOOLEAN DEFAULT 0,
  has_pytorch BOOLEAN DEFAULT 0,
  requires_gpu BOOLEAN DEFAULT 0,
  problem_type TEXT DEFAULT 'free' CHECK (problem_type IN ('free', 'premium')),
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'coming_soon', 'archived')),
  estimated_time TEXT,
  description TEXT,
  problem_statement TEXT,
  starter_code TEXT DEFAULT '{}',
  solution TEXT DEFAULT '{}',
  test_cases TEXT DEFAULT '[]',
  hints TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(roadmap_id, module_id, chapter_id, lesson_id, problem_id)
);
INSERT INTO "roadmap_problems" VALUES(1,'matrix-multiplication-1762883681468','sequential-vs-parallel-programming','introduction-to-parallel-computing','cuda-fundamentals','cuda-programming','matrix-multiplication','Optimized Matrix Multiplication Problem','hard',1,1,0,'free','live','60 minutes','Implement matrix multiplication using parallel processing','Given two matrices A and B, implement parallel matrix multiplication','{"python":"import numpy as np\n\ndef matrix_multiply(A, B):\n    # Your implementation here\n    pass"}','{"python":"import numpy as np\n\ndef matrix_multiply(A, B):\n    return np.dot(A, B)"}','[]','[]','2025-11-11 17:54:41','2025-11-11 18:00:06');
INSERT INTO "roadmap_problems" VALUES(2,'matrix-multiplication-1763014429930','sequential-vs-parallel-programming','introduction-to-parallel-computing','cuda-fundamentals','cuda-programming','matrix-multiplication','Matrix Multiplication Problem','medium',1,1,0,'free','live','60 minutes','Implement matrix multiplication using parallel processing','Given two matrices A and B, implement parallel matrix multiplication','{"python":"import numpy as np\n\ndef matrix_multiply(A, B):\n    # Your implementation here\n    pass"}','{"python":"import numpy as np\n\ndef matrix_multiply(A, B):\n    return np.dot(A, B)"}','[]','[]','2025-11-13 06:13:50','2025-11-13 06:13:50');
INSERT INTO "roadmap_problems" VALUES(9,'problem-1-create-and-reshape-temperature-grid-1764403109343','array-reshape-index','numpy-array-essentials','numpy-fundamentals','numpy','Problem_1_create-and-reshape-temperature-grid','Create and Reshape Temperature Grid','easy',0,0,0,'free','live','15 minutes','Create and manipulate a temperature data grid using NumPy arrays','Create a temperature grid and reshape it for data analysis','{"python":"import numpy as np\n\n# Create and reshape temperature data\ndef process_temperature_grid():\n    # Your implementation here\n    pass"}','{"python":"import numpy as np\n\n# Solution for temperature grid processing"}','[]','[]','2025-11-29 07:58:29','2025-11-29 07:58:29');
INSERT INTO "roadmap_problems" VALUES(10,'problem-2-normalize-student-scores-1764403122150','aggregating-broadcasting','data-manipulation-techniques','numpy-fundamentals','numpy','Problem_2_normalize-student-scores','Normalize Student Scores','easy',0,0,0,'free','live','15 minutes','Normalize student scores using statistical methods and broadcasting','Apply normalization techniques to student score data','{"python":"import numpy as np\n\n# Normalize student scores\ndef normalize_scores(scores):\n    # Your implementation here\n    pass"}','{"python":"import numpy as np\n\n# Solution for score normalization"}','[]','[]','2025-11-29 07:58:42','2025-11-29 07:58:42');
INSERT INTO "roadmap_problems" VALUES(11,'problem-3-apply-discount-to-product-prices-1764403126631','broadcasting-aggregating','numerical-computations','numpy-fundamentals','numpy','Problem_3_apply-discount-to-product-prices','Apply Discount to Product Prices','easy',0,0,0,'free','live','15 minutes','Apply discount calculations using broadcasting and aggregation','Calculate discounted prices for products using NumPy operations','{"python":"import numpy as np\n\n# Apply discount to product prices\ndef apply_discount(prices, discounts):\n    # Your implementation here\n    pass"}','{"python":"import numpy as np\n\n# Solution for discount calculation"}','[]','[]','2025-11-29 07:58:46','2025-11-29 07:58:46');
CREATE TABLE IF NOT EXISTS "users" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL UNIQUE,
    customer_type TEXT NOT NULL DEFAULT 'free' CHECK(customer_type IN ('free', 'paid')),
    compute_count INTEGER NOT NULL DEFAULT 100,
    enrollment_date DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "users" VALUES(10,'fazlulkarim362@gmail.com','paid',10000,'2025-12-25T12:24:14.157Z','2025-10-14 08:41:30','2025-12-25 12:24:14');
INSERT INTO "users" VALUES(11,'fazlul.own@gmail.com','free',100,NULL,'2025-10-14 10:13:47','2025-10-14 10:13:47');
INSERT INTO "users" VALUES(12,'abrahmansw@gmail.com','paid',10000,'2025-12-19T18:04:28.123Z','2025-10-14 13:30:01','2025-12-19 18:04:28');
INSERT INTO "users" VALUES(13,'mdanawrulkabirfahad123@gmail.com','paid',9982,'2025-12-19T06:03:36.525Z','2025-10-14 15:33:04','2025-12-25 15:08:55');
INSERT INTO "users" VALUES(14,'minhaz.jisun@gmail.com','free',91,NULL,'2025-10-14 17:10:07','2025-10-24 05:57:08');
INSERT INTO "users" VALUES(15,'shajalahamedcse@gmail.com','paid',10000,'2025-12-21T11:33:52.360Z','2025-10-15 01:15:18','2025-12-21 11:33:52');
INSERT INTO "users" VALUES(16,'nibirimtiaz1@gmail.com','free',96,NULL,'2025-10-15 07:11:03','2025-11-04 14:53:37');
INSERT INTO "users" VALUES(17,'imnulhaqueruman18@gmail.com','paid',10000,'2025-12-19T18:07:34.357Z','2025-10-15 07:52:26','2025-12-23 05:15:11');
INSERT INTO "users" VALUES(18,'islamraihan009@gmail.com','free',99,NULL,'2025-10-15 11:25:12','2025-10-15 11:25:18');
INSERT INTO "users" VALUES(19,'tahnikahmedraiyan@gmail.com','paid',9997,'2025-12-19T18:07:23.380Z','2025-10-15 11:55:12','2025-12-21 20:05:31');
INSERT INTO "users" VALUES(20,'ping.samnan@gmail.com','free',99,NULL,'2025-10-15 17:35:22','2025-10-15 17:36:14');
INSERT INTO "users" VALUES(21,'ihemon74@gmail.com','free',96,NULL,'2025-10-18 17:56:24','2025-10-18 17:56:37');
INSERT INTO "users" VALUES(22,'u1809014@student.cuet.ac.bd','free',98,NULL,'2025-10-18 18:00:21','2025-10-18 18:00:53');
INSERT INTO "users" VALUES(23,'simec.nick@gmail.com','free',100,NULL,'2025-10-18 18:50:55','2025-10-18 18:50:55');
INSERT INTO "users" VALUES(24,'ahnafnabil14@gmail.com','free',100,NULL,'2025-10-18 18:57:31','2025-10-18 18:57:31');
INSERT INTO "users" VALUES(25,'nisharulbcicswiss@gmail.com','free',100,NULL,'2025-10-21 06:56:10','2025-10-21 06:56:10');
INSERT INTO "users" VALUES(26,'0xh7ml.py@gmail.com','paid',9960,'2025-11-27T18:57:08.780Z','2025-10-21 08:57:33','2025-12-25 16:30:47');
INSERT INTO "users" VALUES(27,'anawrulkabir12345@gmail.com','free',100,NULL,'2025-10-21 15:37:48','2025-11-28 08:18:55');
INSERT INTO "users" VALUES(28,'fazlulkarim361@gmail.com','free',100,NULL,'2025-10-22 14:34:33','2025-10-22 14:34:33');
INSERT INTO "users" VALUES(29,'u2003143@student.cuet.ac.bd','free',64,NULL,'2025-10-22 15:58:10','2025-12-25 14:57:25');
INSERT INTO "users" VALUES(30,'saikat.oubd@gmail.com','free',96,NULL,'2025-10-23 04:48:34','2025-12-14 17:50:03');
INSERT INTO "users" VALUES(31,'paiduser@example.com','free',100,NULL,'2025-10-23 07:49:27','2025-10-23 08:15:23');
INSERT INTO "users" VALUES(32,'expiry-test@example.com','free',100,NULL,'2025-10-23 08:18:48','2025-10-23 08:21:58');
INSERT INTO "users" VALUES(33,'yasinarafat9889@gmail.com','free',82,NULL,'2025-10-23 17:31:51','2025-12-21 14:08:59');
INSERT INTO "users" VALUES(34,'tanveer.ahmed.own@gmail.com','free',100,NULL,'2025-10-24 13:27:29','2025-10-24 13:27:29');
INSERT INTO "users" VALUES(35,'almazed9@gmail.com','paid',9996,'2025-12-21T08:05:58.751Z','2025-10-24 16:25:50','2025-12-24 17:54:11');
INSERT INTO "users" VALUES(36,'mtanmoy5086@gmail.com','free',100,NULL,'2025-10-26 14:18:16','2025-10-26 14:18:16');
INSERT INTO "users" VALUES(37,'fazlul.karim1.mail@gmail.com','paid',9999,'2025-12-25T12:28:33.370Z','2025-10-28 06:02:40','2025-12-25 15:54:18');
INSERT INTO "users" VALUES(38,'sabbirimon@gmail.com','paid',10000,'2025-12-19T18:07:20.818Z','2025-10-28 22:19:18','2025-12-19 18:07:20');
INSERT INTO "users" VALUES(39,'madihaahmedchowdhury6183@gmail.com','paid',9996,'2025-12-09T14:53:52.863Z','2025-10-29 03:51:57','2025-12-25 16:19:39');
INSERT INTO "users" VALUES(40,'ynsk9113@gmail.com','free',100,NULL,'2025-10-31 17:37:39','2025-10-31 17:37:39');
INSERT INTO "users" VALUES(41,'iammhador@gmail.com','free',99,NULL,'2025-11-01 06:15:16','2025-11-01 06:17:03');
INSERT INTO "users" VALUES(42,'rahulkr31.01@gmail.com','free',99,NULL,'2025-11-03 05:14:20','2025-11-03 05:14:32');
INSERT INTO "users" VALUES(44,'test-auth@example.com','free',1,NULL,'2025-11-10 16:12:52','2025-11-10 16:12:53');
INSERT INTO "users" VALUES(45,'test-wrong-token@example.com','free',1,NULL,'2025-11-10 16:14:52','2025-11-10 16:14:52');
INSERT INTO "users" VALUES(46,'user@example.com','free',100,NULL,'2025-11-11 17:43:29','2025-11-11 17:43:29');
INSERT INTO "users" VALUES(47,'ymshezan@gmail.com','free',100,NULL,'2025-11-19 06:12:56','2025-11-19 06:12:56');
INSERT INTO "users" VALUES(48,'u2004052@student.cuet.ac.bd','free',84,NULL,'2025-11-19 08:24:03','2025-11-19 08:48:35');
INSERT INTO "users" VALUES(49,'u1904083@student.cuet.ac.bd','free',96,NULL,'2025-11-19 08:41:02','2025-11-27 17:55:48');
INSERT INTO "users" VALUES(50,'nazim210180@diit.edu.bd','free',100,NULL,'2025-11-26 07:48:04','2025-11-26 07:48:04');
INSERT INTO "users" VALUES(51,'whoami.asif@gmail.com','free',100,NULL,'2025-12-06 13:30:05','2025-12-06 13:30:05');
INSERT INTO "users" VALUES(52,'udit.sharma820@gmail.com','free',99,NULL,'2025-12-06 16:28:20','2025-12-06 16:29:04');
INSERT INTO "users" VALUES(53,'tanviraunjum030@gmail.com','free',100,NULL,'2025-12-10 06:41:09','2025-12-10 06:41:09');
INSERT INTO "users" VALUES(54,'mai.t.long88@gmail.com','free',100,NULL,'2025-12-10 18:27:33','2025-12-10 18:27:33');
INSERT INTO "users" VALUES(55,'nafizahmed273273@gmail.com','free',100,NULL,'2025-12-11 21:05:42','2025-12-11 21:05:42');
INSERT INTO "users" VALUES(56,'kamrul.login@gmail.com','free',98,NULL,'2025-12-15 07:04:22','2025-12-15 07:05:18');
INSERT INTO "users" VALUES(57,'mahmudul@diit.edu.bd','free',100,NULL,'2025-12-15 07:56:56','2025-12-15 07:56:56');
INSERT INTO "users" VALUES(58,'dasniloy2020@gmail.com','paid',9996,'2025-12-19T18:05:53.322Z','2025-12-15 15:19:09','2025-12-26 14:50:41');
INSERT INTO "users" VALUES(59,'md.ahsan.iqbal@gmail.com','paid',10000,'2025-12-19T18:07:51.425Z','2025-12-15 15:40:27','2025-12-19 18:07:51');
INSERT INTO "users" VALUES(60,'ayatullah7755@gmail.com','paid',9996,'2025-12-19T18:05:50.481Z','2025-12-15 15:41:04','2025-12-25 20:48:57');
INSERT INTO "users" VALUES(61,'fromsabbir@gmail.com','paid',10000,'2025-12-19T18:07:18.448Z','2025-12-15 15:41:09','2025-12-19 18:07:53');
INSERT INTO "users" VALUES(62,'shihab.hassan.51.cse@gmail.com','paid',9998,'2025-12-19T18:06:51.991Z','2025-12-15 15:52:57','2025-12-23 08:41:00');
INSERT INTO "users" VALUES(63,'jamilxt@gmail.com','free',100,NULL,'2025-12-16 14:13:04','2025-12-16 14:13:04');
INSERT INTO "users" VALUES(64,'arifislamarif344@gmail.com','free',100,NULL,'2025-12-16 14:20:36','2025-12-16 14:20:36');
INSERT INTO "users" VALUES(65,'mdalmizanakon@gmail.com','free',100,NULL,'2025-12-16 14:21:52','2025-12-16 14:21:52');
INSERT INTO "users" VALUES(66,'mh6367828@gmail.com','free',99,NULL,'2025-12-16 14:22:40','2025-12-16 14:23:17');
INSERT INTO "users" VALUES(67,'sumonrubd@gmail.com','free',99,NULL,'2025-12-16 14:28:23','2025-12-16 14:28:57');
INSERT INTO "users" VALUES(68,'posttomufj@gmail.com','free',99,NULL,'2025-12-16 14:33:32','2025-12-16 14:33:43');
INSERT INTO "users" VALUES(69,'sfaysal111@gmail.com','free',100,NULL,'2025-12-16 14:40:28','2025-12-16 14:40:28');
INSERT INTO "users" VALUES(70,'bsse1108@iit.du.ac.bd','free',100,NULL,'2025-12-16 14:50:40','2025-12-16 14:50:40');
INSERT INTO "users" VALUES(71,'sohanmock@gmail.com','free',100,NULL,'2025-12-16 14:50:40','2025-12-16 14:50:40');
INSERT INTO "users" VALUES(72,'modu.157617@gmail.com','free',100,NULL,'2025-12-16 14:51:04','2025-12-16 14:51:04');
INSERT INTO "users" VALUES(73,'shoaib.shahriar01@gmail.com','free',100,NULL,'2025-12-16 14:52:32','2025-12-16 14:52:32');
INSERT INTO "users" VALUES(74,'omarshahid232@gmail.com','paid',10000,'2025-12-19T18:05:34.523Z','2025-12-16 14:54:41','2025-12-19 18:05:34');
INSERT INTO "users" VALUES(75,'shamikdey7@gmail.com','free',99,NULL,'2025-12-17 06:50:10','2025-12-17 06:52:08');
INSERT INTO "users" VALUES(76,'islamrafiul046@gmail.com','free',99,NULL,'2025-12-17 06:51:06','2025-12-17 06:51:15');
INSERT INTO "users" VALUES(77,'iqbalhossainsojib921@gmail.com','free',100,NULL,'2025-12-17 07:10:52','2025-12-17 07:10:52');
INSERT INTO "users" VALUES(78,'arjokaraditto1199@gmail.com','free',100,NULL,'2025-12-17 07:47:20','2025-12-17 07:47:20');
INSERT INTO "users" VALUES(79,'md.zihad0246@gmail.com','free',100,NULL,'2025-12-17 08:19:37','2025-12-17 08:19:37');
INSERT INTO "users" VALUES(80,'medlectures002@gmail.com','free',100,NULL,'2025-12-17 08:35:25','2025-12-17 08:35:25');
INSERT INTO "users" VALUES(81,'abeshahsan2002@gmail.com','free',100,NULL,'2025-12-17 08:56:58','2025-12-17 08:56:58');
INSERT INTO "users" VALUES(82,'tomhasan3@gmail.com','free',100,NULL,'2025-12-17 09:00:48','2025-12-17 09:00:48');
INSERT INTO "users" VALUES(83,'t123alha@gmail.com','free',100,NULL,'2025-12-17 10:13:27','2025-12-17 10:13:27');
INSERT INTO "users" VALUES(84,'arafat.csedu.57@gmail.com','free',100,NULL,'2025-12-17 10:49:31','2025-12-17 10:49:31');
INSERT INTO "users" VALUES(85,'nbsoft2022@gmail.com','free',99,NULL,'2025-12-17 10:53:31','2025-12-17 10:56:16');
INSERT INTO "users" VALUES(86,'mehidi2022@gmail.com','free',100,NULL,'2025-12-17 12:34:28','2025-12-17 12:34:28');
INSERT INTO "users" VALUES(87,'im.walid.hasan@gmail.com','free',98,NULL,'2025-12-17 12:50:25','2025-12-17 12:50:56');
INSERT INTO "users" VALUES(88,'mopashaheen@gmail.com','free',100,NULL,'2025-12-17 13:47:37','2025-12-17 13:47:37');
INSERT INTO "users" VALUES(89,'mdfaridhossenrehad@gmail.com','free',99,NULL,'2025-12-17 14:56:55','2025-12-17 14:56:58');
INSERT INTO "users" VALUES(90,'sf61561@gmail.com','free',100,NULL,'2025-12-17 16:58:40','2025-12-17 16:58:40');
INSERT INTO "users" VALUES(91,'pshuvo181@gmail.com','free',99,NULL,'2025-12-17 17:21:35','2025-12-17 17:21:50');
INSERT INTO "users" VALUES(92,'nuralam01758421239@gmail.com','free',98,NULL,'2025-12-17 17:23:13','2025-12-17 17:25:38');
INSERT INTO "users" VALUES(93,'sajal0904@cseku.ac.bd','free',100,NULL,'2025-12-17 17:23:22','2025-12-17 17:23:22');
INSERT INTO "users" VALUES(94,'aashemul@gmail.com','free',100,NULL,'2025-12-17 18:07:09','2025-12-17 18:07:09');
INSERT INTO "users" VALUES(95,'imrulhassan989@gmail.com','free',99,NULL,'2025-12-17 18:16:26','2025-12-17 18:16:41');
INSERT INTO "users" VALUES(96,'zeehadzeeshan@gmail.com','free',98,NULL,'2025-12-17 19:03:40','2025-12-17 19:04:16');
INSERT INTO "users" VALUES(97,'ssadman552@gmail.com','free',100,NULL,'2025-12-17 21:26:51','2025-12-17 21:26:51');
INSERT INTO "users" VALUES(98,'siddharthosen09@gmail.com','free',100,NULL,'2025-12-17 23:24:28','2025-12-17 23:24:28');
INSERT INTO "users" VALUES(99,'hasan.chamok16@gmail.com','free',93,NULL,'2025-12-18 01:38:23','2025-12-18 02:17:36');
INSERT INTO "users" VALUES(100,'sagorhs329@gmail.com','free',100,NULL,'2025-12-18 02:31:05','2025-12-18 02:31:05');
INSERT INTO "users" VALUES(101,'sifatnabil@gmail.com','paid',9999,'2025-12-19T18:07:25.785Z','2025-12-18 05:22:37','2025-12-23 15:19:49');
INSERT INTO "users" VALUES(102,'dfahim432@gmail.com','free',99,NULL,'2025-12-18 06:55:42','2025-12-18 06:56:05');
INSERT INTO "users" VALUES(103,'9285262@gmail.com','free',100,NULL,'2025-12-18 09:28:13','2025-12-18 09:28:13');
INSERT INTO "users" VALUES(104,'minaakter2105@gmail.com','free',100,NULL,'2025-12-18 11:54:37','2025-12-18 11:54:37');
INSERT INTO "users" VALUES(105,'faiyaz.tahsin.242@northsouth.edu','free',100,NULL,'2025-12-18 19:27:04','2025-12-18 19:27:04');
INSERT INTO "users" VALUES(106,'lemuel.k.costuna.so@gmail.com','free',100,NULL,'2025-12-19 09:59:34','2025-12-19 09:59:34');
INSERT INTO "users" VALUES(107,'talhajubaer3121@gmail.com','free',100,NULL,'2025-12-19 12:07:47','2025-12-19 12:07:47');
INSERT INTO "users" VALUES(108,'sudipta1604129@gmail.com','paid',10000,'2025-12-19T16:49:52.250Z','2025-12-19 16:44:02','2025-12-19 16:49:52');
INSERT INTO "users" VALUES(109,'u2003143@student.cuet.ac.d','paid',10000,'2025-12-19T17:38:15.172Z','2025-12-19 17:35:55','2025-12-19 17:38:15');
INSERT INTO "users" VALUES(110,'u2003143@student.cuet.a.d','free',100,NULL,'2025-12-19 17:39:36','2025-12-20 13:20:58');
INSERT INTO "users" VALUES(111,'muhammad.cse36@gmail.com','paid',10000,'2025-12-19T18:04:31.178Z','2025-12-19 18:04:29','2025-12-19 18:04:31');
INSERT INTO "users" VALUES(112,'fazle.ferdaus1416@gmail.com','paid',9997,'2025-12-19T18:04:34.165Z','2025-12-19 18:04:32','2025-12-26 05:22:46');
INSERT INTO "users" VALUES(113,'sazidozon@gmail.com','paid',10000,'2025-12-19T18:04:37.227Z','2025-12-19 18:04:35','2025-12-19 18:04:37');
INSERT INTO "users" VALUES(114,'farhanbuet09@gmail.com','paid',9997,'2025-12-19T18:04:40.594Z','2025-12-19 18:04:38','2025-12-23 19:34:45');
INSERT INTO "users" VALUES(115,'atia.s.ipa@gmail.com','paid',10000,'2025-12-19T18:04:43.781Z','2025-12-19 18:04:41','2025-12-19 18:04:43');
INSERT INTO "users" VALUES(116,'anol.mahi@gmail.com','paid',10000,'2025-12-19T18:04:47.286Z','2025-12-19 18:04:45','2025-12-19 18:04:47');
INSERT INTO "users" VALUES(117,'anamul.ice14@gmail.com','paid',10000,'2025-12-19T18:04:50.581Z','2025-12-19 18:04:48','2025-12-19 18:04:50');
INSERT INTO "users" VALUES(118,'tafirahman01@gmail.com','paid',10000,'2025-12-19T18:04:53.710Z','2025-12-19 18:04:51','2025-12-19 18:04:53');
INSERT INTO "users" VALUES(119,'aroupdhruba@gmail.com','paid',10000,'2025-12-19T18:05:02.411Z','2025-12-19 18:05:00','2025-12-19 18:05:02');
INSERT INTO "users" VALUES(120,'hasibfaisal130@gmail.com','paid',10000,'2025-12-19T18:05:05.597Z','2025-12-19 18:05:03','2025-12-19 18:05:05');
INSERT INTO "users" VALUES(121,'krity.haque@gmail.com','paid',10000,'2025-12-19T18:05:08.589Z','2025-12-19 18:05:06','2025-12-19 18:05:08');
INSERT INTO "users" VALUES(122,'moontasir042@gmail.com','paid',9998,'2025-12-19T18:05:12.371Z','2025-12-19 18:05:10','2025-12-25 04:22:11');
INSERT INTO "users" VALUES(123,'mohammadshafin.cs@gmail.com','paid',10000,'2025-12-19T18:05:15.561Z','2025-12-19 18:05:13','2025-12-19 18:05:15');
INSERT INTO "users" VALUES(124,'mr.tamal0007@gmail.com','paid',10000,'2025-12-19T18:05:19.784Z','2025-12-19 18:05:17','2025-12-19 18:05:19');
INSERT INTO "users" VALUES(125,'sakhawath2009@gmail.com','paid',10000,'2025-12-19T18:05:22.979Z','2025-12-19 18:05:21','2025-12-19 18:05:23');
INSERT INTO "users" VALUES(126,'shrifat1337@gmail.com','paid',10000,'2025-12-19T18:05:26.108Z','2025-12-19 18:05:24','2025-12-19 18:05:26');
INSERT INTO "users" VALUES(127,'alqurayish@gmail.com','paid',10000,'2025-12-19T18:05:29.175Z','2025-12-19 18:05:27','2025-12-19 18:05:29');
INSERT INTO "users" VALUES(128,'towhid139@gmail.com','paid',10000,'2025-12-19T18:05:32.161Z','2025-12-19 18:05:30','2025-12-19 18:05:32');
INSERT INTO "users" VALUES(129,'humayra52@gmail.com','paid',10000,'2025-12-19T18:05:37.561Z','2025-12-19 18:05:35','2025-12-19 18:05:37');
INSERT INTO "users" VALUES(130,'iftekharcse95@gmail.com','paid',10000,'2025-12-19T18:05:40.642Z','2025-12-19 18:05:38','2025-12-19 18:05:40');
INSERT INTO "users" VALUES(131,'gaziashiq.dev@gmail.com','paid',10000,'2025-12-19T18:05:43.709Z','2025-12-19 18:05:41','2025-12-19 18:05:43');
INSERT INTO "users" VALUES(132,'sakibxvz@gmail.com','paid',10000,'2025-12-19T18:05:48.083Z','2025-12-19 18:05:45','2025-12-19 18:05:48');
INSERT INTO "users" VALUES(133,'jfkjumbo1@gmail.com','paid',10000,'2025-12-19T18:05:56.383Z','2025-12-19 18:05:54','2025-12-19 18:05:56');
INSERT INTO "users" VALUES(134,'whtdahellizdis@gmail.com','paid',9998,'2025-12-19T18:05:59.409Z','2025-12-19 18:05:57','2025-12-25 05:57:46');
INSERT INTO "users" VALUES(135,'rajenlodh@gmail.com','paid',9999,'2025-12-19T18:06:02.477Z','2025-12-19 18:06:00','2025-12-26 04:57:43');
INSERT INTO "users" VALUES(136,'chayan.php@gmail.com','paid',9997,'2025-12-19T18:06:06.988Z','2025-12-19 18:06:03','2025-12-26 14:59:15');
INSERT INTO "users" VALUES(137,'sh.shoaib8@gmail.com','paid',10000,'2025-12-19T18:06:10.150Z','2025-12-19 18:06:08','2025-12-19 18:06:10');
INSERT INTO "users" VALUES(138,'pritompurkayasta@gmail.com','paid',10000,'2025-12-19T18:06:13.640Z','2025-12-19 18:06:11','2025-12-19 18:06:13');
INSERT INTO "users" VALUES(139,'musfiqur.emat@gmail.com','paid',10000,'2025-12-19T18:06:17.038Z','2025-12-19 18:06:15','2025-12-19 18:06:17');
INSERT INTO "users" VALUES(140,'mashud275@gmail.com','paid',9994,'2025-12-19T18:06:20.533Z','2025-12-19 18:06:18','2025-12-25 17:04:57');
INSERT INTO "users" VALUES(141,'minhzfahim605@gmail.com','paid',10000,'2025-12-19T18:06:23.669Z','2025-12-19 18:06:21','2025-12-19 18:06:23');
INSERT INTO "users" VALUES(142,'mahehasan@gmail.com','paid',10000,'2025-12-19T18:06:26.659Z','2025-12-19 18:06:24','2025-12-19 18:06:26');
INSERT INTO "users" VALUES(143,'shaon.cuet@gmail.com','paid',9997,'2025-12-19T18:06:30.403Z','2025-12-19 18:06:27','2025-12-22 14:52:09');
INSERT INTO "users" VALUES(144,'rabiulrabi.cse@gmail.com','paid',10000,'2025-12-19T18:06:33.382Z','2025-12-19 18:06:31','2025-12-19 18:06:33');
INSERT INTO "users" VALUES(145,'riyad.uiu@gmail.com','paid',10000,'2025-12-19T18:06:36.408Z','2025-12-19 18:06:34','2025-12-19 18:06:36');
INSERT INTO "users" VALUES(146,'malikmutasim2121@gmail.com','paid',10000,'2025-12-19T18:06:39.567Z','2025-12-19 18:06:37','2025-12-19 18:06:39');
INSERT INTO "users" VALUES(147,'infohasnat@gmail.com','paid',10000,'2025-12-19T18:06:43.300Z','2025-12-19 18:06:41','2025-12-19 18:06:43');
INSERT INTO "users" VALUES(148,'nobelrakib03@gmail.com','paid',10000,'2025-12-19T18:06:46.460Z','2025-12-19 18:06:44','2025-12-19 18:06:46');
INSERT INTO "users" VALUES(149,'istiyakaminsanto@gmail.com','paid',10000,'2025-12-19T18:06:49.594Z','2025-12-19 18:06:47','2025-12-19 18:06:49');
INSERT INTO "users" VALUES(150,'arifdu008@gmail.com','paid',10000,'2025-12-19T18:06:55.374Z','2025-12-19 18:06:53','2025-12-19 18:06:55');
INSERT INTO "users" VALUES(151,'rafifardin44@gmail.com','paid',10000,'2025-12-19T18:06:58.359Z','2025-12-19 18:06:56','2025-12-19 18:06:58');
INSERT INTO "users" VALUES(152,'mta0shawon@gmail.com','paid',9996,'2025-12-19T18:07:01.326Z','2025-12-19 18:06:59','2025-12-25 07:06:25');
INSERT INTO "users" VALUES(153,'shuvoj360@gmail.com','paid',10000,'2025-12-19T18:07:04.416Z','2025-12-19 18:07:02','2025-12-19 18:07:04');
INSERT INTO "users" VALUES(154,'mshossain9339@gmail.com','paid',9999,'2025-12-19T18:07:07.445Z','2025-12-19 18:07:05','2025-12-24 18:12:23');
INSERT INTO "users" VALUES(155,'farhadur.fahim@gmail.com','paid',10000,'2025-12-19T18:07:10.470Z','2025-12-19 18:07:08','2025-12-19 18:07:10');
INSERT INTO "users" VALUES(156,'seekers.treehouse@gmail.com','paid',10000,'2025-12-19T18:07:13.501Z','2025-12-19 18:07:11','2025-12-19 18:07:13');
INSERT INTO "users" VALUES(157,'taki.prostuti.001@gmail.com','paid',9997,'2025-12-19T18:07:28.820Z','2025-12-19 18:07:26','2025-12-24 10:25:05');
INSERT INTO "users" VALUES(158,'misbahul.amin459@gmail.com','paid',10000,'2025-12-19T18:07:31.817Z','2025-12-19 18:07:30','2025-12-19 18:07:31');
INSERT INTO "users" VALUES(159,'shanewazmahmud328@gmail.com','paid',9989,'2025-12-19T18:07:37.367Z','2025-12-19 18:07:35','2025-12-24 05:16:46');
INSERT INTO "users" VALUES(160,'tareqmia315@gmail.com','paid',10000,'2025-12-19T18:07:40.347Z','2025-12-19 18:07:38','2025-12-19 18:07:40');
INSERT INTO "users" VALUES(161,'rfsamrat@gmail.com','paid',10000,'2025-12-19T18:07:43.429Z','2025-12-19 18:07:41','2025-12-19 18:07:43');
INSERT INTO "users" VALUES(162,'mdazizkhn@gmail.com','paid',10000,'2025-12-19T18:07:49.008Z','2025-12-19 18:07:47','2025-12-19 18:07:49');
INSERT INTO "users" VALUES(163,'arifmainuddin18@gmail.com','free',100,NULL,'2025-12-20 11:45:02','2025-12-20 11:45:02');
INSERT INTO "users" VALUES(164,'a28250291@gmail.com','free',94,NULL,'2025-12-20 12:55:37','2025-12-20 13:04:30');
INSERT INTO "users" VALUES(165,'tahfimism@gmail.com','free',100,NULL,'2025-12-20 14:22:45','2025-12-20 14:22:45');
INSERT INTO "users" VALUES(166,'dayamoydatta96@gmail.com','free',100,NULL,'2025-12-20 17:40:22','2025-12-20 17:40:22');
INSERT INTO "users" VALUES(167,'shaon.nibz@gmail.com','free',100,NULL,'2025-12-20 18:05:23','2025-12-20 18:05:23');
INSERT INTO "users" VALUES(168,'mutasimfuadsharker@gmail.com','free',100,NULL,'2025-12-21 04:13:54','2025-12-21 04:13:54');
INSERT INTO "users" VALUES(169,'cowboyold365@gmail.com','free',100,NULL,'2025-12-21 04:49:08','2025-12-21 04:49:08');
INSERT INTO "users" VALUES(170,'nizamcse.seu@gmail.com','free',99,NULL,'2025-12-21 05:55:40','2025-12-21 06:46:48');
INSERT INTO "users" VALUES(171,'noman007.cse@gmail.com','free',100,NULL,'2025-12-21 08:21:05','2025-12-21 08:21:05');
INSERT INTO "users" VALUES(172,'nicklesson23@gmail.com','free',100,NULL,'2025-12-21 13:41:14','2025-12-21 13:41:14');
INSERT INTO "users" VALUES(173,'mtxmaruf@gmail.com','free',100,NULL,'2025-12-22 13:22:18','2025-12-22 13:22:18');
INSERT INTO "users" VALUES(174,'fahad.poridhi@gmail.com','free',83,NULL,'2025-12-22 14:21:59','2025-12-24 15:25:51');
INSERT INTO "users" VALUES(175,'mintora1.1.1@gmail.com','free',100,NULL,'2025-12-23 03:34:39','2025-12-23 03:34:39');
INSERT INTO "users" VALUES(176,'sheikhahnafshifat@gmail.com','free',100,NULL,'2025-12-23 08:13:00','2025-12-23 08:13:00');
INSERT INTO "users" VALUES(177,'mmashrur1@gmail.com','free',100,NULL,'2025-12-23 09:30:45','2025-12-23 09:30:45');
INSERT INTO "users" VALUES(178,'tanzimbinnasir@gmail.com','free',100,NULL,'2025-12-23 09:32:06','2025-12-23 09:32:06');
INSERT INTO "users" VALUES(179,'lelin.rashed784@gmail.com','free',100,NULL,'2025-12-23 09:51:18','2025-12-23 09:51:18');
INSERT INTO "users" VALUES(180,'shohanurvu@gmail.com','free',100,NULL,'2025-12-23 10:12:37','2025-12-23 10:12:37');
INSERT INTO "users" VALUES(181,'ridvi123@gmail.com','free',100,NULL,'2025-12-23 11:41:22','2025-12-23 11:41:22');
INSERT INTO "users" VALUES(182,'caedon_huller@student.solancosd.org','free',98,NULL,'2025-12-23 15:09:07','2025-12-23 15:27:05');
INSERT INTO "users" VALUES(183,'kamrulhasan59246@gmail.com','free',100,NULL,'2025-12-23 16:23:23','2025-12-23 16:23:23');
INSERT INTO "users" VALUES(184,'rajnakib2003@gmail.com','free',100,NULL,'2025-12-23 16:36:33','2025-12-23 16:36:33');
INSERT INTO "users" VALUES(185,'abrarjubah82@gmail.com','free',99,NULL,'2025-12-24 02:39:55','2025-12-24 03:05:57');
INSERT INTO "users" VALUES(186,'asifahmedsahil.007@gmail.com','free',100,NULL,'2025-12-24 03:55:39','2025-12-24 03:55:39');
INSERT INTO "users" VALUES(187,'u1904014@student.cuet.ac.bd','free',95,NULL,'2025-12-24 06:08:05','2025-12-24 06:13:24');
INSERT INTO "users" VALUES(188,'shyannafis@gmail.com','free',100,NULL,'2025-12-24 11:27:19','2025-12-24 11:27:19');
INSERT INTO "users" VALUES(189,'rhasan082@gmail.com','free',100,NULL,'2025-12-24 14:49:47','2025-12-24 14:49:47');
INSERT INTO "users" VALUES(190,'faishal.yousuf@gmail.com','free',100,NULL,'2025-12-25 00:45:08','2025-12-25 00:45:08');
INSERT INTO "users" VALUES(191,'abdunaim2018nuist@gmail.com','free',100,NULL,'2025-12-25 05:43:32','2025-12-25 05:43:32');
INSERT INTO "users" VALUES(192,'polash.hemromux@gmail.com','free',100,NULL,'2025-12-26 15:07:16','2025-12-26 15:07:16');
INSERT INTO "users" VALUES(193,'faruk.just.random.use@gmail.com','free',96,NULL,'2025-12-26 16:50:44','2025-12-26 16:54:09');
INSERT INTO "users" VALUES(194,'kallolbiseee@gmail.com','free',100,NULL,'2025-12-26 23:00:33','2025-12-26 23:00:33');
INSERT INTO "users" VALUES(195,'onix.hoque.mist@gmail.com','free',100,NULL,'2025-12-27 02:02:26','2025-12-27 02:02:26');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('categories',4);
INSERT INTO "sqlite_sequence" VALUES('subcategories',3);
INSERT INTO "sqlite_sequence" VALUES('chapters',2);
INSERT INTO "sqlite_sequence" VALUES('problems',2);
INSERT INTO "sqlite_sequence" VALUES('labs',1);
INSERT INTO "sqlite_sequence" VALUES('users',195);
INSERT INTO "sqlite_sequence" VALUES('roadmaps',13);
INSERT INTO "sqlite_sequence" VALUES('modules',24);
INSERT INTO "sqlite_sequence" VALUES('roadmap_chapters',29);
INSERT INTO "sqlite_sequence" VALUES('lessons',81);
INSERT INTO "sqlite_sequence" VALUES('roadmap_labs',149);
INSERT INTO "sqlite_sequence" VALUES('roadmap_problems',11);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_subcategories_slug ON subcategories(slug);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_chapters_slug ON chapters(slug);
CREATE INDEX idx_chapters_subcategory_id ON chapters(subcategory_id);
CREATE INDEX idx_problems_chapter_id ON problems(chapter_id);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_problem_type ON problems(problem_type);
CREATE INDEX idx_problems_requires_gpu ON problems(requires_gpu);
CREATE INDEX idx_labs_chapter_id ON labs(chapter_id);
CREATE INDEX idx_labs_difficulty ON labs(difficulty);
CREATE INDEX idx_labs_problem_type ON labs(problem_type);
CREATE INDEX idx_labs_requires_gpu ON labs(requires_gpu);
CREATE INDEX idx_users_email ON users(user_email);
