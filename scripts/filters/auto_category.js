hexo.extend.filter.register('before_generate', function (data) {
    const fs = require('fs');
    const path = require('path');

    function traverseDir(rootDir, category) {
        const files = fs.readdirSync(rootDir);
        files.forEach((filename) => {
            const filepath = path.join(rootDir, filename);
            if (fs.statSync(filepath).isDirectory()) {
                // js是引用传递，递归时需要先拷贝数组，再开始递归。
                // 否则大家都用的同一个数组，会出现问题
                const newCategory = [...category]
                newCategory.push(path.basename(filepath))
                traverseDir(filepath, newCategory);
            } else if (path.extname(filepath) === '.md') {
                const content = fs.readFileSync(filepath, 'utf-8');
                const regex = /categories:[\s\S]*?(?=\n[\w-]+:|\n$)/g;
                let newContent = content.replace(regex, (match, p1, offset, string) => {
                    // 第一个文件名是"_posts","about"这些，不需要
                    category.shift();
                    // 把匹配到的内容替换成新的内容
                    if (category.length == 0) {
                        match = `categories:`;
                    }
                    if (category.length == 1) {
                        match = `categories:\n\t- ${category.toString()}`;
                    }
                    if (category.length > 1) {
                        match = `categories:\n\t- [${category.toString()}]`;
                    }
                    return match;
                })
                fs.writeFileSync(filepath, newContent, 'utf-8');
            }
        });
    }

    traverseDir(hexo.source_dir, []);
})