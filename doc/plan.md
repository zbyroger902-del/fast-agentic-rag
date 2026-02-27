Hi now I wish you can work together with me to form the detailed PRD so that my cursor agent can start its work in a controlled frame.
I wanna accept your previous suggestion on the overall scheme but I have made several refinement and extension:

**Frontend**: Shadcn/UI + React Flow. (Ask Cursor: "Create a React Flow canvas where nodes represent LangChain steps").
**Backend**: FastAPI. Use Server-Sent Events (SSE) for streaming text (Dify does this, and users expect it).Also backend api calls to Qdrant and LlamaParse should be async.
**File parsing Engine**: I am wishing to have a two layer processing engine. THe default should be free open-source one It is significantly better than LangChain for complex PDF/Table retrieval. PyMuPDF will be the default tool for pdf parsing. Llamaindex is the backup engine for tasks that PyMuPDF cannot tackle well. **I need a suggestion of default tool and advance toll for other docs as well**. 
**RAG** Can I use llamaindex in the my local codebase and call LlamaParse as the backup advance processing engine? What's your suggestion on it?
**Orchestration**: LangGraph. It allows you to define the "flow" of the conversation as a state machine.
**Observability** Able to trace all interactions inside the scope of my main system(my backend and frontend). With minimal effort, better something with decent result by default.
**LLM** I am going to use the new Qwne3.5Plus since it is native multi-modal and have very friendly pricing. Also because I am hosting using Railway.com which is also hosing, it's easier to call LLM api online rather than self-hosting a LLM.
**Tool calling** I would like to wrap the file-procecssing api as the tool that the model can access if the user upload file to agent and ask the agent to load the file or just answer questions based on the file. If the file is no large that 10 Mb it will be ingested in the knowledge base by default so the agent shall need these tools.

But here still I wish to make the user experience  and flow sequence more clear and precise so cursor agent can understand my actual imagination on the interfaces.

I wish that my system having 4 main interfaces:
The **first** one will be the agent iside bar or floating side window that can shrink to a small icon at corner but can also expand to a chatbot interface onClick. Like the one on the right in cursor. Interface like a typical chatbot. User can control whether to hide this side bar or they can type and also upload common types of docs(pdf, doc,excel,ppt etc.) as well as common picture file. Agent will answer the request based on user input. If not input given, default answer will be asking what's the user's intention if no file given; if a file is given, futher asking whether the user just want to add the given file into knowledge base.

The **second** one will be the knowledge base where user should be able upload the file, select parsing engine,chunking method, retrieval and rerank feature on their own.They also should to view overview of the file chunks,metadata info etc. Also a recall test function like dify's one should be provided.

The **third** one shoule be a large canvas in nodes connecting with each other way same as dify. I don't need much visual effec, just minimal  enough will be fine. Here I wish to mimic a workflow. Showing basic logical flow and use of tools with langchain steps under the hood would be enough.

A **fourth** one will be an itegrated tracing tab. I wish to integrate a basic tracing funciton for both the agent and the workflow nodes. Different type should be grouping together for better visibility.



**But I am not a UI/UX designer that I am not sure how can I at least find a similar prototype for the coding agent.I wish to minimize the understanding gap between me and the coding agent. Language usually is not enough. Plese help me with above**