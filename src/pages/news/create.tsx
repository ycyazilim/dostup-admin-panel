import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { useCreate } from "@refinedev/core";
import { Form, Input, Upload, Button, Space, Select } from "antd";
import { CloudUploadOutlined, UploadOutlined } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import { useNavigate } from "react-router-dom";

export const NewsCreate = () => {
    const { formProps, saveButtonProps } = useForm({});
    const { mutate } = useCreate();
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const { selectProps: categorySelectProps, query: queryData } = useSelect({
        resource: "categories/list",
        sort: [
            {
                field: "title",
                order: "asc",
            },
        ],
        onSearch: (value) => [
            {
                field: "title",
                operator: "contains",
                value,
            },
        ],
    });

    console.log('categorySelectProps', queryData?.data?.data);




    const createFormData = async (values) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('excerpt', values.excerpt);
        formData.append('category', values.category);
        formData.append('user', "6723c21f12030d6f36879c80")

        fileList.forEach((file) => {
            formData.append("images", file.originFileObj);
        });

        await mutate(
            {
                resource: 'news/create',
                values: formData,
                options: {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            },
            {
                onSuccess: () => {
                    navigate('/blogs', { replace: true });
                }
            }
        );
    };

    const handleUploadChange = ({ fileList }) => setFileList(fileList);

    return (
        <Create saveButtonProps={saveButtonProps} title={"Create News"}>
            <Form
                {...formProps}
                onFinish={(values) => {
                    createFormData(values);
                }}
                layout="vertical"
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: "Please enter a title" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Excerpt"
                    name="excerpt"
                    rules={[{ required: true, message: "Please enter a excerpt" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: "Please enter content" }]}
                >
                    <MDEditor data-color-mode="light" />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name={["category"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select {...categorySelectProps}
                        options={[
                            {
                                label: "Select a category",
                                value: "",
                                disabled: true,
                            },
                            ...queryData.data?.data.map((category) => ({
                                label: category.category,
                                value: category._id,
                            })),
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Images">
                    <Upload
                        multiple
                        beforeUpload={() => false} // Prevent automatic upload
                        onChange={handleUploadChange}
                        listType="picture"
                        defaultFileList={existingImages.map((url, index) => ({
                            uid: index,
                            name: `Existing Image ${index + 1}`,
                            status: "done",
                            url: `http://localhost:3003/upload-file/blogs/${url}`,
                        }))}
                    >
                        <Button icon={<CloudUploadOutlined />}>Upload Images</Button>
                    </Upload>
                    <Space direction="horizontal" wrap>
                        {existingImages.map((src, index) => (
                            <img
                                key={index}
                                src={`http://localhost:3003/upload-file/blogs/${src}`}
                                alt={`Existing Image ${index + 1}`}
                                style={{ width: 100, height: 100 }}
                            />
                        ))}
                    </Space>
                </Form.Item>
            </Form>
        </Create>
    );
};