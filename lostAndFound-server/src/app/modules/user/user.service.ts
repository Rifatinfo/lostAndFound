
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request } from "express";
import prisma from "../../../shared/prisma";


import { userSearchableFields } from "./user.constant";

import { Prisma, UserRole } from "@prisma/client";
import { optimizeAndSaveImage } from "@/app/utils/imageOptimizer";
import { generateUserSlug } from "@/app/utils/generateUserSlug";
import { IOptions, paginationHelper } from "@/app/helpers/paginationHelper";



const createCustomer = async (
  req: Request & { file?: Express.Multer.File }
) => {
  const { name, email, password } = req.body;

  // ===== 1. Generate slug =====
  const slug = generateUserSlug(name?.trim());

  // ===== 2. Parallel processing  =====
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  const [hashedPassword, filename] = await Promise.all([
    bcrypt.hash(password, saltRounds),

    req.file
      ? optimizeAndSaveImage(req.file, `users/${slug}`)
      : Promise.resolve(null),
  ]);

  const avatarUrl = filename
    ? `/uploads/users/${slug}/${filename}`
    : null;

  // ===== 3. Create User =====
  const user = await prisma.user.create({
    data: {
      email,
      name,
      slug, 
      password: hashedPassword,
      avatar: avatarUrl,
      role: UserRole.CUSTOMER,
      needPasswordChange: false,   // newly added 
    },
  });

  // ===== 4. Create related data (Batch Transaction ) =====
  await prisma.$transaction([
    prisma.authProvider.create({
      data: {
        provider: "CREDENTIALS",
        password: hashedPassword,
        userId: user.id,
      },
    }),

    prisma.customer.create({
      data: {
        userId: user.id,
        name,
        email,
        avatar: avatarUrl,
        password : hashedPassword
      },
    }),
  ]);

  // ===== 5. Return clean response =====
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  };
};

const getAllFromDB = async (params: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}


const createAdmin = async (req: Request & { file?: Express.Multer.File }) => {    const { name, email, password, phone } = req.body;

    // ===== Generate slug =====
    const slug = name ? await generateUserSlug(name.trim()) : `user-${crypto.randomBytes(6).toString("hex")}`;
    let avatarUrl: string | null = null;

    if (req.file) {
        const userFolder = `users/${slug}`;
        const filename = await optimizeAndSaveImage(req.file, userFolder);
        avatarUrl = `/uploads/${userFolder}/${filename}`;
    }

    // ===== Hash password =====
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ===== Prisma Transaction =====
    const result = await prisma.$transaction(async (tx) => {
        // 1 Create User
        const user = await tx.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                avatar: avatarUrl,
                role: UserRole.ADMIN,
            },
        });


        // 3 Create Admin Profile
        const admin = await tx.admin.create({
            data: {
                userId: user.id,
                name,
                email,
                phone,
                avatar: avatarUrl,
                password: hashedPassword,
            },
        });

        return admin;
    });

    return result;
};


const updateMe = async (session: any, payload: any) => {
  const me = await prisma.user.findUniqueOrThrow({
    where: { email: session.email, status: "ACTIVE" as any },
  });

  const data: any = {};
  if (typeof payload.name === "string") data.name = payload.name.trim();
  if (typeof payload.bio === "string") data.bio = payload.bio.trim();
  if (typeof payload.phone === "string") data.phone = payload.phone.trim();
  if (typeof payload.avatar === "string") data.avatar = payload.avatar;

  const updated = await prisma.user.update({
    where: { id: me.id },
    data,
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatar: updated.avatar,
    coverPhoto: updated.coverPhoto,
    bio: updated.bio,
    phone: updated.phone,
    role: updated.role,
  };
};

const updateAvatar = async (session: any, file?: Express.Multer.File) => {
  const me = await prisma.user.findUniqueOrThrow({
    where: { email: session.email },
  });

  let avatarUrl = me.avatar;
  if (file) {
    const folder = `users/${me.slug || me.id}`;
    const filename = await optimizeAndSaveImage(file, folder);
    avatarUrl = `/uploads/${folder}/${filename}`;
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: me.id }, data: { avatar: avatarUrl } }),
    prisma.customer.updateMany({ where: { userId: me.id }, data: { avatar: avatarUrl } }),
  ]);

  return { avatar: avatarUrl };
};

const updateCover = async (session: any, file?: Express.Multer.File) => {
  const me = await prisma.user.findUniqueOrThrow({
    where: { email: session.email },
  });

  if (!file) {
    throw new Error("Cover photo is required");
  }

  const folder = `users/${me.slug || me.id}/cover`;
  const filename = await optimizeAndSaveImage(file, folder);
  const coverUrl = `/uploads/${folder}/${filename}`;

  await prisma.user.update({
    where: { id: me.id },
    data: { coverPhoto: coverUrl },
  });

  return { coverPhoto: coverUrl };
};

export const UserService = {
    createCustomer,
    getAllFromDB,
    createAdmin,
    updateMe,
    updateAvatar,
    updateCover,
};