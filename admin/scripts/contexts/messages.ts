/**
 * 이 파일은 서비스데스크 모듈의 일부입니다. (https://www.coursemos.co.kr)
 *
 * 메일 발송 히스토리를 리스트한다.
 *
 * @file /modules/email/admin/scripts/contexts/messages.ts
 * @author pbj <ju318@ubion.co.kr>
 * @license MIT License
 * @modified 2024. 10. 15.
 *
 * @var \modules\naddle\desk\Desk $me
 */
Admin.ready(async () => {
    const me = Admin.getModule('email') as modules.email.admin.Email;

    return new Aui.Tab.Panel({
        id: 'messages-context',
        iconClass: 'mi mi-message-dots',
        title: '이메일관리',
        border: false,
        layout: 'column',
        disabled: true,
        topbar: [
            new Aui.Form.Field.Search({
                id: 'keyword',
                width: 200,
                emptyText: '수신자',
                handler: async (keyword) => {
                    const context = Aui.getComponent('messages-context') as Aui.Tab.Panel;
                    const messages = context.getActiveTab().getItemAt(0) as Aui.Grid.Panel;
                    if (keyword.length > 0) {
                        messages.getStore().setParam('keyword', keyword);
                    } else {
                        messages.getStore().setParam('keyword', null);
                    }
                    messages.getStore().loadPage(1);
                },
            }),
        ],
        items: [],
        listeners: {
            render: async (tab) => {
                const results = await me.getMomo().viewers.get('messages');
                if (results.success == true) {
                    for (const viewer of results.records) {
                        tab.append(
                            new Aui.Panel({
                                id: viewer.viewer_id,
                                title: viewer.title,
                                iconClass: viewer.icon,
                                layout: 'column',
                                border: false,
                                items: [
                                    new Aui.Grid.Panel({
                                        border: false,
                                        flex: 1,
                                        selection: { selectable: true, type: 'column', cancelable: true },
                                        autoLoad: false,
                                        freeze: 1,
                                        bottombar: new Aui.Grid.Pagination([
                                            new Aui.Button({
                                                iconClass: 'mi mi-refresh',
                                                handler: (button) => {
                                                    const grid = button.getParent().getParent() as Aui.Grid.Panel;
                                                    grid.getStore().reload();
                                                },
                                            }),
                                        ]),
                                        columns: [
                                            {
                                                text: '제목',
                                                dataIndex: 'title',
                                                selectable: true,
                                                sortable: true,
                                                minWidth: 280,
                                                flex: 1,
                                            },
                                            {
                                                text: '발송자',
                                                dataIndex: 'sended_by',
                                                width: 260,
                                                renderer: (value, record) => {
                                                    return (
                                                        me.getMomo().getMemberName(value) +
                                                        ' &lt;' +
                                                        record.get('sended_email') +
                                                        '&gt;'
                                                    );
                                                },
                                            },
                                            {
                                                text: '수신자',
                                                dataIndex: 'member_by',
                                                width: 260,
                                                renderer: (value, record) => {
                                                    return (
                                                        me.getDesk().getMemberName(value) +
                                                        ' &lt;' +
                                                        record.get('email') +
                                                        '&gt;'
                                                    );
                                                },
                                            },
                                            {
                                                text: '보낸시간',
                                                dataIndex: 'sended_at',
                                                width: 150,
                                                sortable: true,
                                                filter: new Aui.Grid.Filter.Date({
                                                    format: 'timestamp',
                                                }),
                                                renderer: (value) => {
                                                    return Format.date('Y.m.d(D) H:i', value);
                                                },
                                            },
                                            {
                                                text: '확인시간',
                                                dataIndex: 'read_at',
                                                width: 150,
                                                sortable: true,
                                                filter: new Aui.Grid.Filter.Date({
                                                    format: 'timestamp',
                                                }),
                                                renderer: (value) => {
                                                    if (value != undefined) {
                                                        return Format.date('Y.m.d(D) H:i', value);
                                                    } else {
                                                        return '';
                                                    }
                                                },
                                            },

                                            {
                                                text: '발송상태',
                                                dataIndex: 'status',
                                                width: 100,
                                                sortable: true,
                                                filter: new Aui.Grid.Filter.List({
                                                    dataIndex: 'status',
                                                    store: new Aui.Store.Local({
                                                        fields: ['display', { name: 'value', type: 'string' }],
                                                        records: [
                                                            ['성공', 'TRUE'],
                                                            ['실패', 'FALSE'],
                                                        ],
                                                    }),
                                                    displayField: 'display',
                                                    valueField: 'value',
                                                }),
                                                renderer: (value) => {
                                                    const statuses = {
                                                        'TRUE': '<span class="success">성공</span>',
                                                        'FALSE': '<span class="fail">실패</span>',
                                                    };
                                                    return statuses[value];
                                                },
                                            },
                                        ],
                                        store: new Aui.Store.Remote({
                                            url: me.getProcessUrl('messages'),
                                            primaryKeys: ['message_id'],
                                            filters: viewer.filters,
                                            sorters: viewer.sorters ?? { sended_at: 'DESC' },
                                            limit: 50,
                                            remoteSort: true,
                                            remoteFilter: true,
                                        }),
                                        listeners: {
                                            update: (grid) => {
                                                if (
                                                    Admin.getContextSubUrl(1) !== null &&
                                                    grid.getSelections().length == 0
                                                ) {
                                                    grid.select({ message_id: Admin.getContextSubUrl(1) });
                                                }
                                            },
                                            selectionChange: (selection, grid) => {
                                                const detail = grid.getParent().getItemAt(1) as Aui.Panel;

                                                if (selection.length == 0) {
                                                    detail.hide();
                                                } else {
                                                    const record = selection[0];
                                                    detail.properties.update(detail, record);
                                                    detail.show();
                                                }

                                                Aui.getComponent('messages-context').properties.setUrl();
                                            },
                                        },
                                    }),

                                    new Aui.Panel({
                                        width: 600,
                                        minWidth: 600,
                                        hidden: true,
                                        border: [false, false, false, true],
                                        resizable: [false, false, false, true],
                                        title: new Aui.Title({
                                            text: 'Loading...',
                                            tools: [],
                                        }),
                                        items: [
                                            new Aui.Panel({
                                                border: false,
                                                layout: 'row',
                                                scrollable: false,
                                                items: [
                                                    new Aui.Panel({
                                                        border: false,
                                                        flex: 1,
                                                        scrollable: true,
                                                        html: '<div data-role="massages"></div>',
                                                    }),
                                                ],
                                            }),
                                        ],
                                        update: async (tab: Aui.Tab.Panel, record: Aui.Data.Record) => {
                                            const results = await Ajax.get(me.getProcessUrl('message'), {
                                                message_id: record.get('message_id'),
                                            });
                                            tab.getTitle().setTitle(record.get('title'));
                                            const $massages = Html.get('div[data-role=massages]', tab.$getContent());
                                            $massages.html(String(results.data));
                                        },
                                    }),
                                ],
                            })
                        );
                    }
                }

                if (Admin.getContextSubUrl(0) !== null && Aui.getComponent(Admin.getContextSubUrl(0)) !== null) {
                    tab.active(Admin.getContextSubUrl(0));
                } else {
                    tab.active(0);
                }

                tab.setDisabled(false);
            },
            active: async (panel, tab) => {
                const grid = panel.getItemAt(0) as Aui.Grid.Panel;
                const keyword = Aui.getComponent('keyword') as Aui.Form.Field.Search;
                keyword.setValue(grid.getStore().getParam('keyword') ?? null);
                Aui.getComponent('messages-context').properties.setUrl();

                const message_id = Admin.getContextSubUrl(1);
                if (message_id !== null) {
                    const results = await Ajax.get(me.getProcessUrl('messages'), {
                        ...(await grid.getStore().getLoaderParams()),
                        message_id: message_id,
                    });

                    if (results.success == true) {
                        if (results.page == -1) {
                            if (panel.getId() != 'all') {
                                Admin.setContextSubUrl('/all/' + message_id);
                                tab.active('all');
                            } else {
                                Admin.setContextSubUrl('/all');
                                grid.getStore().load();
                            }
                        } else {
                            grid.getStore().loadPage(results.page);
                        }
                    }
                } else if (grid.getStore().isLoaded() == false) {
                    grid.getStore().load();
                }

                if (grid.getStore().isLoaded() == false) {
                    grid.getStore().load();
                }
            },
        },
        setUrl: () => {
            const context = Aui.getComponent('messages-context') as Aui.Tab.Panel;
            const tab = context.getActiveTab() as Aui.Tab.Panel;
            if (Admin.getContextSubUrl(0) !== tab.getId()) {
                Admin.setContextSubUrl('/' + tab.getId());
            }

            const grid = tab.getItemAt(0) as Aui.Grid.Panel;
            if (grid.getStore().isLoaded() == true) {
                if (grid.getSelections().length == 0) {
                    Admin.setContextSubUrl('/' + tab.getId());
                } else {
                    const record = grid.getSelections()[0];
                    if (Admin.getContextSubUrl(1) !== record.get('message_id')) {
                        Admin.setContextSubUrl('/' + tab.getId() + '/' + record.get('message_id'));
                    }
                }
            }
        },
        reloadAll: async () => {
            const context = Aui.getComponent('messages-context') as Aui.Tab.Panel;
            const reloads = [];
            for (const tab of context.getItems() as Aui.Panel[]) {
                const grid = tab.getItemAt(0) as Aui.Grid.Panel;
                reloads.push(grid.getStore().reload());
            }
            await Promise.all(reloads);
        },
    });
});