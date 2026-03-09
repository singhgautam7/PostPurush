export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "PostPurush",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  );
}
