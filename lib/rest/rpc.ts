// lib/rest/rpc.ts
const POSTGREST_URL = process.env.POSTGREST_URL || "";
const POSTGREST_SECRET = process.env.POSTGREST_SECRET || "";

type RpcParams = {
  success: boolean;
  title: string;
  message: string;
}
export type RpcResponseType = RpcParams & Record<string, string | number | boolean>;

export async function callRpc(functionName: string, params: Record<string, string | number | boolean> = {} ): Promise<RpcResponseType> {
  try {


    const response = await fetch(`${POSTGREST_URL}/rpc/${functionName}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + POSTGREST_SECRET
      },
      body: JSON.stringify(params),
      cache: "no-store"
    });


    if (!response.ok) {
      console.error("PostgREST RPC ", await response.text(), " failed ", response.status); // TODO
      return { 
        success: false, 
        title: "Server Error", 
        message: "خطای ارتباط با سرور." 
      } as RpcResponseType;
    }

    try {

      const data = await response.json();

      if (!data.success) {
        console.error("PostgREST RPC ", data.message, " failed ", data.title); // TODO
        return {
          success: false,
          title: data.title,
          message: data.message,
        } as RpcResponseType;
      }

      return data as RpcResponseType; // XXX

    } catch (error) {
      console.error("PostgREST RPC ", error); // TODO
      return {
        success: false,
        title: "Parse Error",
        message: "پاسخ سرور نامعتبر است.",
      } as RpcResponseType;
    }

  } catch (error) {
    console.error("PostgREST RPC ", error); // TODO
    return { 
      success: false, 
      title: "Error in Server", 
      message: "خطای در سرور." 
    } as RpcResponseType;
  }
}