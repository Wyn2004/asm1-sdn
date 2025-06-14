import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/route";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOption);
  const userId = session?.user.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "asm1-sdn" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });

  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const image = new URL(req.url).searchParams;
  const imageUrl = image.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Image URL is required" },
      { status: 400 }
    );
  }

  // Trích xuất public_id từ URL
  const matches = imageUrl.match(
    /upload\/(?:v\d+\/)?(.+)\.(?:jpg|jpeg|png|webp|avif)/
  );
  const publicId = matches?.[1];

  if (!publicId) {
    return NextResponse.json(
      { error: "Invalid Cloudinary URL" },
      { status: 400 }
    );
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return NextResponse.json(
      { error: "Cloudinary deletion failed" },
      { status: 500 }
    );
  }
}
