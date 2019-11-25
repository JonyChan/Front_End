import React from 'react';
import Axios from 'axios';
import './App.css';
import 'antd/dist/antd.css';
import { Table, Form, Input, Button, Modal, message } from 'antd';
const { confirm } = Modal;

class App extends React.Component {
  state = {
    tableLoading: false, // table Loading
    loading: false, // modal 弹窗确认按钮loading
    visible: false, // modal 弹窗是否显示
    modifyDisable: true, // 编辑按钮disable
    deleteDisable: true, // 删除按钮disable
    modalType: 'new', // modal 弹窗类型
    searchInfo: { // 搜索信息
      dockPn: '',
      compatibilityPn: ''
    },
    pagination: { // 分页信息
      total: 0,
      current: 1,
      pageSize: 5,
      onChange: (page) => this.handleTableChange(page),
    },
    dockPn: '', // modal 弹窗数据
    compatibilityPn: '',
    footNoteId: '',
    dockList:[], // dock 列表
    columns: [ // table组件的行数据
      {
        title: 'Dock PN',
        dataIndex: 'dockPn',
        key: 'dockPN',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Compatibility PN',
        dataIndex: 'compatibilityPn',
        key: 'compatibilityPN',
      },
      {
        title: 'Description',
        dataIndex: 'cpnDescription',
        key: 'cpnDescription',
      },
      {
        title: 'Footnode ID',
        dataIndex: 'footNoteId',
        key: 'footNoteId',
      },
      {
        title: 'Footnode Text',
        dataIndex: 'footNoteText',
        key: 'footNoteText',
      },
    ]
  };
  // 展示modal的点击事件
  showModal = (type) => {
    this.setState({
      modalType: type || 'new',
      visible: true,
    });
  };
  // modal 确认按钮点击
  handleOk = (e) => {
    this.setState({ loading: true });
    e.preventDefault();
   
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.state.modalType === 'modify') {
          if (!this.idList || !this.idList.length) return
          this.onModifyDock(this.idList[0]);
        } else if (this.state.modalType === 'new') {
          this.onAddDock(values);
        }
      }
    });
  }
  // Search 按钮点击事件
  handleSearch = () => {
    this.onGetDockList();
  }
  // 弹窗关闭事件
  handleCancel = () => {
    this.setState({ visible: false });
  }
  // 搜索数据input变化监听
  handleChange = (e) => {
    const { name, value} = e.target;
    this.state.searchInfo[name] = value;
    this.setState({
      searchInfo: this.state.searchInfo
    });
  }
  // 编辑按钮点击事件
  handleModify = () => {
    this.showModal('modify');
    if (!this.idList || this.idList.length === 0) return;
    const id = this.idList[0];
    const activeItem = this.state.dockList.find(item => item.id === id);
    const { dockPn, compatibilityPn, footNoteId } =  activeItem;
    this.props.form.setFieldsValue({
      dockPn, compatibilityPn, footNoteId
    });
  }
  // 删除按钮点击事件
  handleDelete = () => {
    const self = this;
    confirm({
      title: 'Do you want to delete that you had chosen？',
      content: 'please be careful, as it cannot be recovered!',
      okText: 'delete',
      okType: 'danger',
      cancelText: 'close',
      onOk() {
        self.onDeleteDock(self.idList);
      },
    });
  }
  render () {
    const { visible, loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    
    return (
      <div className="App">
        <Form layout="inline">
          <Form.Item label="Dock PN">
            <Input name="dockPn" value={this.state.searchInfo.dockPn} onChange={this.handleChange} placeholder="please input dock PN" />
          </Form.Item>
          <Form.Item label="Compatibility PN">
            <Input name="compatibilityPn" value={this.state.searchInfo.compatibilityPn} onChange={this.handleChange} placeholder="please input part number" />
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={this.handleSearch}>
              Search
            </Button>
          </Form.Item>
        </Form>
        <Table
          pagination={this.state.pagination}
          loading={this.state.tableLoading}
          rowSelection={this.rowSelection} 
          dataSource={this.state.dockList} 
          columns={this.state.columns} >
        </Table>
        <Form layout="inline" layout="inline">
          <Form.Item>
            <Button type="default" onClick={this.handleModify} disabled={this.state.modifyDisable}>
              Modify
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={this.handleDelete}  disabled={this.state.deleteDisable}>
              Delete
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={ () => this.showModal('new')}>
              Add
            </Button>
          </Form.Item>
        </Form>
        <Modal
          visible={visible}
          title={this.state.modalType === 'modify' ? 'Modify Dock' : 'Add Dock'}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              OK
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Form.Item label="Dock PN">
              {getFieldDecorator('dockPn', {
                rules: [
                  {
                    required: true, 
                    whitespace: true,
                    message: 'Please input your Dock PN!',
                  },
                ],
              })(<Input placeholder="please input Dock PN" disabled={this.state.modalType === 'modify'} />)}
            </Form.Item>
            <Form.Item label="Compatibility PN" >
            {getFieldDecorator('compatibilityPn', {
                rules: [
                  {
                    required: true, 
                    whitespace: true,
                    message: 'Please input your compatibility PN!',
                  },
                ],
              })(<Input placeholder="please input compatibility PN" disabled={this.state.modalType === 'modify'} />)}
            </Form.Item>
            <Form.Item label="Footnode ID:" >
              {getFieldDecorator('footNoteId')(<Input placeholder="please input Footnode PN" />)}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };
  componentDidMount () {
    this.onGetDockList();
  };
  // 分页change事件
  handleTableChange (page) {
    this.state.pagination.current = page;
    this.setState({
      pagination: this.state.pagination
    });
    this.onGetDockList();
  };
  // 获取dock列表
  onGetDockList () {
    this.setState({
      tableLoading: true
    });
    const { pageSize, current:pageNow } = this.state.pagination;
    const { dockPn, compatibilityPn } = this.state.searchInfo;
    // Axios.get("/dock/findDocks", {
    Axios.get("/dock/findAll", {

      params: { pageSize, pageNow, dockPn, compatibilityPn }
    }).then(res => {
      if (res.status === 200 && res.data.errorCode === 0) {
        const { data, totalNum } = res.data;
        this.state.pagination.total = totalNum
        this.setState({
          dockList: data.map(item => Object.assign(item, { key: item.id})),
          pagination: this.state.pagination
        });
      }
      this.setState({
        tableLoading: false
      });
    }).catch(err => {
      this.setState({
        tableLoading: false
      });
    })
  };
  // 添加dock
  onAddDock (values) {
    Axios.post("/dock/save", values).then(res => {
      if (res.status === 200 && res.data.errorCode === 0) {
        if (res.data.data) {
          message.success('Added successfully!');
          this.handleCancel();
          this.onGetDockList();
        }
      }
      this.setState({
        loading: false
      });
    }).catch(err => {
      this.setState({
        loading: false
      });
    })
  };
  //编辑dock
  onModifyDock (id) {
    const { dockPn, compatibilityPn, footNoteId } = this.props.form.getFieldsValue();
    Axios.post(`/dock/update?id=${id}`, {
      dockPn, compatibilityPn, footNoteId,id
    }).then(res => {
      if (res.status === 200 && res.data.errorCode === 0) {
        if (res.data.data) {
          message.success('Edited successfully!');
          this.handleCancel();
          this.onGetDockList();
        }
      }
      this.setState({
        loading: false
      });
    }).catch(err => {
      this.setState({
        loading: false
      });
    })
  };
  //删除dock
  onDeleteDock (idList) {
    if (!idList || idList.length === 0) return;
    Axios.post("/dock/deleteById", {
      ids: idList.join(",")
            // ids: idList.join(",")

    }).then(res => {
      if (res.status === 200 && res.data.errorCode === 0) {
        if (res.data.data) {
          message.success('deleted succesfully!');
          this.handleCancel();
          this.onGetDockList();
        }
      }
    });
  };
 
  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      if (selectedRows.length > 1) {
        this.setState({
          modifyDisable: true,
          deleteDisable: false
        });
      } else if (selectedRows.length === 1){
        this.setState({
          modifyDisable: false,
          deleteDisable: false
        });
      }else if (selectedRows.length === 0){
        this.setState({
          modifyDisable: false,
          deleteDisable: false
        });
      }
      this.idList = selectedRows.map(item => item.id);
    }
  };
}
export default Form.create()(App);
