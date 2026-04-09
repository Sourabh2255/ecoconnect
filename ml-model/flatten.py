import os
import shutil

base_dir = "archive"

for category in os.listdir(base_dir):
    category_path = os.path.join(base_dir, category)

    for root, dirs, files in os.walk(category_path):
        for file in files:
            if file.endswith(('.jpg', '.png', '.jpeg')):
                src = os.path.join(root, file)
                dst = os.path.join(category_path, file)

                if src != dst:
                    shutil.move(src, dst)

    # remove empty folders
    for root, dirs, files in os.walk(category_path, topdown=False):
        for d in dirs:
            folder_path = os.path.join(root, d)
            if not os.listdir(folder_path):
                os.rmdir(folder_path)

print("✅ Fully flattened")